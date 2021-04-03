import jwtManager from 'jsonwebtoken';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import * as _ from './constants';
import { ErrBadRequest, ErrForbidden, ErrNotFound, ErrUnauthorized } from './errors';
import { hash, log, newUuid, ts, validateEmailAddress, rndEmailVerificationCode } from './utils';
import { ISecurityMgr } from './security';
import { IEmailMgr } from './emails';
import { IDb } from './db';
import { IConfig } from './config';
import { IAdvertDetailsModel, IAdvertSummaryModel, IArticleDetailsModel, IPostDetailsModel, IPostSummaryModel, IUser, IUserPublic } from './types';

export interface IApiProps {
  config: IConfig;
  db: IDb;
  securityMgr: ISecurityMgr;
  emailMgr: IEmailMgr;
}

export interface IApiInput<TInput = any> {
  user?: any;
  id?: string | null;
  input?: TInput;
}

export interface IMetaBase {
  row_count: number;
}

export interface IApiResult<TData = any, TMeta = IMetaBase> {
  data?: TData;
  meta?: TMeta;
  error?: string | null;
}

export type ISignUpInput = IApiInput<{
  username?: string;
  password?: string;
  password_confirm?: string;
}>

export type ISignUpOutput = Promise<IApiResult<ISignInData>>;

export interface ISignInData {
  id: string;
  username: string;
  token: string;
  token_type: 'Bearer';
}

export type ISignInInput = IApiInput<{
  username?: string;
  password?: string;
}>;

export type ISignInOutput = Promise<IApiResult<ISignInData>>;

export interface ISignOutData {
  token: string;
}

export type ISignOutOutput = Promise<IApiResult<ISignOutData>>;

export type IUserRetrieveInput = IApiInput<{ id?: string; username?: string; }>;

export type IUserRetrieveOutput = Promise<IApiResult<IUserPublic>>;


export type IPostSearchInput = IApiInput<{
  user_id?: string | null;
  username?: string | null;
  q?: string | null;
  tag?: string | null;
  min_price?: string | null;
  max_price?: string | null;
  offset?: string | null;
  limit?: string | null;
  with_assets?: boolean | null;
}>;

export type IPostSearchOutput = Promise<IApiResult<Array<IPostSummaryModel>>>;

export type IAdvertSearchInput = IApiInput<{
  user_id?: string | null;
  username?: string | null;
  q?: string | null;
  tag?: string | null;
  min_price?: string | null;
  max_price?: string | null;
  offset?: string | null;
  limit?: string | null;
  with_assets?: boolean | null;
}>;

export type IAdvertSearchOutput = Promise<IApiResult<Array<IAdvertSummaryModel>>>;


export function newApi({ config, db, securityMgr, emailMgr }: IApiProps) {

  // TODO: captcha
  async function signup({ input }: ISignUpInput): ISignUpOutput {
    let data = null, error = null;
    try {
      const { username = '', password = '', password_confirm = '' } = input;
      const usernamePruned = securityMgr.pruneUsername(username);
      if (usernamePruned !== username) {
        throw new ErrBadRequest(_.MSG_INVALID_USERNAME);
      }
      if (!(password && password !== '' && password === password_confirm)) {
        throw new ErrBadRequest(_.MSG_INVALID_PASSWORD);
      }
      if (!securityMgr.isStrongPassword(password)) {
        throw new ErrBadRequest(_.MSG_INVALID_PASSWORD);
      }

      const { row: userFound, error: userLookupError } = await db.find(_.TBL_USER, { username }, 1);
      if (userFound) throw new ErrBadRequest(_.MSG_NONUNIQUE_USERNAME);
      if (userLookupError) { // this is unexpected
        // throw new ErrBadRequest(_.MSG_NONUNIQUE_USERNAME);
        throw new Error(_.MSG_UNKNOWN_ERROR);
      }
      const password_hash = await securityMgr.hashPassword(password);
      if (!password_hash) { // this is unexpected
        throw new Error(_.MSG_UNKNOWN_ERROR);
      }
      const id = newUuid();
      const userRow = newRow({ username, password_hash, id, user: { id } });
      const { result, error: insertError } = await db.insert(_.TBL_USER, userRow);
      if (insertError) { // this is unexpected
        // throw insertError;
        throw new Error(_.MSG_UNKNOWN_ERROR);
      }

      // auto-login
      if (result && result.rowCount) {
        const signInOutput = await signin({ input: { username, password }});
        data = signInOutput.data;
        error = signInOutput.error;
      } else {
        // not good
      }
    } catch (err) {
      error = err.message;
    }
    return { data, error };
  }

  async function signin({ input }: ISignInInput): ISignInOutput {
    let data = null, token = null, error = _.MSG_INVALID_CREDENTIALS;

    const { username = '', password = '' } = input;
    username.trim().toLowerCase();
    if (!(username && username !== '' && password && password !== '')) throw new Error(error);

    const { row: found, error: userLookupError } = await db.find<IUser>(_.TBL_USER, { username }, 1);
    if (userLookupError) throw userLookupError;
    if (!found) throw new ErrNotFound(error);

    const passwordOK = await securityMgr.verifyPassword(password, found.password_hash);
    if (!passwordOK) throw new Error(error);

    const { id } = found;
    const userData = { id, username }; // TODO: do not use username, it may be updated by user
    token = jwtManager.sign(userData, config.jwt.secret, { expiresIn: '1d', algorithm: 'HS256' });
    data = { id, username, token, token_type: 'Bearer' };
    error = null;

    return { data, error };
  }

  async function signout(): ISignOutOutput {
    return { data: { token: 'x' }, error: null }; // side-effect ==> invalid cookie on browser
  }

  // TODO: captcha
  async function verify_email_start({ user, input = { email: '' }}) {
    let data = null, error = null;
    const { email = '' } = input;
    while(!data) {
      if (!validateEmailAddress(email)) {
        error = 'invalid email address'; break;
      }
      const code = rndEmailVerificationCode();
      const id = newUuid();
      const row = { id, email, code, created_at: new Date(), used: 0 };
      const { result, error: insertErr } = await db.insert(_.TBL_EMAIL_VERIF, row);
      if (!result || insertErr) {
        log('db error in verify_email_start', insertErr);
        error = 'unexpected error'; break;
      }
      const msgObj = {
        to: email,
        subject: 'Email verification for FrenchBench.org',
        text: 'Please use this code to verify that you own the email address: ' + code,
        html: 'Please use this code to verify that you own the email address: ' + code, // TODO: beautiful email needed
      }
      const emailResult = await emailMgr.sendEmail(msgObj);
      if (emailResult && emailResult.messageId) {
        data = { id, message_id: emailResult.messageId };
      } else {
        error = 'failed to send email'; break;
      }
      break; // run once
    }
    return { data, error };
  }

  async function verify_email_finish({ user, input = { email: '', code: '' }}) {
    let data = null, error = null, found = false;
    const { email = '', code = '' } = input;
    while (!found) {
      if (!validateEmailAddress(email)) {
        error = 'invalid email address or code'; break;
      }
      const { result, error: findErr } = await db.find(_.TBL_EMAIL_VERIF, { email, code, used: 0 });
      if (!result || findErr) {
        log('db error in verify_email_finish', findErr);
        error = 'unexpected error'; break;
      }
      const { rows = [] } = result;
      const now = new Date();
      for (const row of rows) {
        const delta = differenceInSeconds(now, row.created_at);
        if (delta < 10 * 60) { // ok, within 10 minutes, not expired
          found = true;
          break;
        }
      }
      if (!found) {
        error = 'invalid email address or code'; // no clues for hackers ;)
        break;
      }
      // save verified email address in db
      const change = { email, email_verified: 1 };
      const { result: resultUpdate, error: updateErr } = await db.update(_.TBL_USER, { id: user.id }, change);
      if (!resultUpdate || updateErr) {
        log('db error in verify_email_finish', findErr);
        error = 'unexpected error';
        break;
      }
      data = { success: true };
      break; // run once
    }
    return { data, error };
  }

  // we can use user_retrieve
  async function user_retrieve_self({ user = { id: '' }}: IUserRetrieveInput): IUserRetrieveOutput {
    const { id = '' } = user ?? {};
    if (id && (id !== '')) {
      const { row, error } = await db.find<IUser>(_.TBL_USER, { id }, 1);
      const data = securityMgr.hideSensitiveUserProps(row);
      return { data, error };
    } else {
      log('user_retrieve_self: user id is null');
      return { data: null, error: 'user id is null' };
    }
  }

  async function user_retrieve({ id = null }: IUserRetrieveInput): IUserRetrieveOutput {
    let data = null;
    // TODO: analytics of 'views' per record per visitor per day
    const condition = { id };
    if (!id) throw new ErrBadRequest(_.MSG_ID_REQUIRED);
    const { row, error } = await db.find(_.TBL_USER, condition, 1);
    if (error) throw error;
    data = securityMgr.hideSensitiveUserProps(row);
    return { data, error };
  }

  async function user_retrieve_by_username({ input = { username: '' }}: IUserRetrieveInput): IUserRetrieveOutput {
    let data = null;
    // TODO: analytics of 'views' per record per visitor per day
    const { username = '' } = input;
    if (!username || (username === '')) throw new ErrBadRequest(_.MSG_USERNAME_REQUIRED);
    const condition = { username };
    const { row, error } = await db.find(_.TBL_USER, condition, 1);
    if (error) throw error;
    data = securityMgr.hideSensitiveUserProps(row);
    return { data, error };
  }

  async function user_search({ user, input = { lat1: 0, lon1: 0, lat2: 0, lon2: 0, with_assets: false } }) {
    let data = [];
    // eslint-disable-next-line prefer-const
    let { lat1 = 0, lon1 = 0, lat2 = 0, lon2 = 0, with_assets } = input;
    // TODO: restrict area that can be searched e.g. by geolocation of current user
    const { latDelta, lonDelta } = config.geo;
    lat1 = lat1 ? lat1 : user.lat - latDelta;
    lat2 = lat2 ? lat2 : user.lat + latDelta;
    lon1 = lon1 ? lon1 : user.lon - lonDelta;
    lon2 = lon2 ? lon2 : user.lon + lonDelta;
    const { result, error: user_search_err } = await db.query(
      'SELECT * FROM ' + _.TBL_USER
      + ' WHERE (lat BETWEEN $1 AND $2)'
      + '   AND (lon BETWEEN $3 AND $4)',
      [lat1, lat2, lon1, lon2],
      'users-in-area',
    );
    if (user_search_err) throw user_search_err;
    data = result.rows.map(securityMgr.hideSensitiveUserProps);

    if (with_assets && data.length) {
      // with side effect on data
      await find_attach_assets({ user, data, parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.USER });
    }

    return { data };
  }

  async function usercontact_update({ user, id, input }) {
    // permission is checked by _isProtected()
    // let { first_name, last_name, email, phone, headline, neighbourhood } = input;
    const change = updateRow({ ...input, user }); // TODO: limit inputs?
    const condition = { id }; // TODO: for now, only user himself can update
    const { result, error } = await db.update(_.TBL_USER, condition, change, 1);
    return { data: result && result.rowCount, error };
  }

  async function usercontact_update_self({ user, input }) {
    // permission is checked by _isProtected()
    // let { first_name, last_name, email, phone, headline, neighbourhood } = input;
    const change = updateRow({ ...input, user }); // TODO: limit inputs?
    const condition = { id: user.id }; // TODO: for now, only user himself can update
    const { result, error } = await db.update(_.TBL_USER, condition, change, 1);
    return { data: result && result.rowCount, error };
  }

  async function usergeo_update({ user, id, input }) {
    // permission is checked by _isProtected()
    const { lat = 0, lon = 0, geo_accuracy = 9999 } = input;
    const now = new Date();
    const change = updateRow({ lat, lon, geo_accuracy, geo_updated_at: now, user });
    const condition = { id }; // TODO: for now, only user himself can update
    const { result, error } = await db.update(_.TBL_USER, condition, change, 1);
    return { data: result && result.rowCount, error };
  }

  async function usergeo_update_self({ user, input }) {
    // permission is checked by _isProtected()
    const { lat = 0, lon = 0, geo_accuracy = 9999 } = input;
    const now = new Date();
    const change = updateRow({ lat, lon, geo_accuracy, geo_updated_at: now, user });
    const condition = { id: user.id }; // TODO: for now, only user himself can update
    const { result, error } = await db.update(_.TBL_USER, condition, change, 1);
    return { data: result && result.rowCount, error };
  }

  async function post_create({ user, input }) {
    if (!user) throw new ErrForbidden();

    // eslint-disable-next-line prefer-const
    let { slug = '', title = '', content = '', tags = '', asset_id = null, lat = 0, lon = 0, geo_accuracy = 9999 } = input;
    const now = new Date();
    const id = newUuid();
    if (!title) title = 'my post';
    if (!slug) slug = title + now.toISOString();
    slug = makePostRef(slug);
    const row = newRow({
      id, user_id: user.id, user,
      slug, title, content, tags,
      lat, lon, geo_accuracy, geo_updated_at: now,
    });
    const { result, error } = await db.insert(_.TBL_POST, row);
    if (asset_id) {
      try {
        const entityAssetInsertResult = await entity_asset_create({
          user,
          input: {
            parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.POST,
            parent_entity_id: id,
            purpose: _.ENTITY_ASSET_PURPOSE.POST_IMAGE,
            asset_id,
          },
        });
        log('entityAssetInsertResult success', entityAssetInsertResult);
      } catch (err) {
        log('entityAssetInsertResult error', err);
      }
    }
    return { data: 0 < result.rowCount ? id : null, error };
  }

  async function post_retrieve({ id }) {
    // TODO: validate uuid
    // TODO: analytics of 'views' per record per visitor per day
    const { row: data, error } = await db.find(_.TBL_POST, { id }, 1);
    return { data, error };
  }

  async function post_update({ user, id, input }) {
    // eslint-disable-next-line prefer-const
    let { slug, title, content, tags, lat = 0, lon = 0, geo_accuracy = 9999 } = input;
    const now = new Date();

    const { row: postFound, error: findPostErr } = await db.find<IPostDetailsModel>(_.TBL_POST, { id }, 1);
    if (findPostErr) throw findPostErr;
    if (!postFound) throw new ErrNotFound(_.MSG_POST_NOT_FOUND);
    if (postFound.user_id !== user.id) throw new ErrForbidden(); // TODO: we can use postFound.created_by

    if (!title) title = 'my post at ' + now.toISOString();
    if (!slug) slug = title;
    slug = makePostRef(slug);
    const change = updateRow({
      user,
      slug, title, content, tags,
      lat, lon, geo_accuracy,
    });
    const { result, error: updatePostError } = await db.update(_.TBL_POST, { id }, change, 1);
    if (updatePostError) throw updatePostError;

    return { data: result && result.rowCount };
  }

  async function post_delete({ id }) {
    // TODO: validate uuid
    // TODO: delete related records
    const { result, error } = await db.del(_.TBL_POST, { id }, 1);
    return { data: 0 < result.rowCount, error };
  }

  async function post_search({ user, input }) {
    let data = [], meta = {}, ph = '';
    // eslint-disable-next-line prefer-const
    let { user_id = null, username = null, q = '', tag = '', offset = 0, limit = 10, with_assets = false } = input;
    offset = Number.parseInt(offset);
    limit = Number.parseInt(limit);
    if (100 < limit) limit = 100;
    const conditions = [], params = [];
    if (user_id) {
      params.push(user_id);
      conditions.push('p.user_id = ' + db.placeHolder(params.length));
    }
    if (username) {
      params.push(username);
      conditions.push('u.username = ' + db.placeHolder(params.length));
    }
    if (q !== '') {
      params.push(`%${q}%`);
      ph = db.placeHolder(params.length); // TODO: use fulltext search
      conditions.push(`p.title LIKE ${ph} OR p.content LIKE ${ph}`);
    }
    if (tag !== '') {
      params.push(`%${tag}%`); // TODO: use tag index
      conditions.push('p.tags LIKE ' + db.placeHolder(params.length));
    }
    const whereStr = conditions.length ? ` WHERE (${conditions.join(') AND (')})` : '';
    
    const paramsNoPagination = [...params];

    params.push(offset);
    const offsetStr = ' OFFSET ' + db.placeHolder(params.length);
    params.push(limit);
    const limitStr = ' LIMIT ' + db.placeHolder(params.length);

    const textNoPagination = `
SELECT
  p.id, p.slug, p.title, p.tags, p.created_at,
  p.created_by, p.user_id, u.username,
  p.lat, p.lon, p.geo_accuracy
FROM ${_.TBL_POST} p
INNER JOIN ${_.TBL_USER} u ON p.user_id = u.id
${whereStr}
ORDER BY p.created_at DESC
`; // TODO: ranking, relevance
    
    const text = textNoPagination + offsetStr + limitStr;
    const qryName = 'posts-text-search-' + hash(text);
    const { result, error: findError } = await db.query(text, params, );
    if (findError) throw findError;
    data = result && result.rows ? result.rows : [];

    meta = await db.queryMeta(textNoPagination, paramsNoPagination, 'meta-' + qryName);

    if (with_assets && data.length) {
      // with side effect on data
      await find_attach_assets({ user, data, parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.POST });
    }

    return { data, meta };
  }

  async function post_search_by_user({ user, input = {} }) {
    // keeping this function for convenience
    // search by user_id/username included in post_search()
    return post_search({ user, input });
  }

  // use retrieve_post(), it is faster
  async function post_retrieve_by_username_and_slug({ user, input = { username: '', slug: '', with_assets: false } }) {
    let data = null;
    // eslint-disable-next-line prefer-const
    let { username = '', slug = '', with_assets = false } = input;
    username = username.toLowerCase();
    slug = slug.toLowerCase();
    const { row: postOwner, error: userError } = await db.find<IPostDetailsModel>(_.TBL_USER, { username }, 1);
    if (userError) throw userError;
    if (!postOwner) throw new ErrNotFound('user not found');

    const text = 'SELECT * FROM ' + _.TBL_POST
      + ' WHERE (user_id = $1) AND (slug = $2)';
    const { result, error: postError } = await db.query(text, [postOwner.id, slug], 'post-by-user-and-ref');
    if (postError) throw postError;
    if (result && result.rows && result.rows[0]) {
      // TODO: analytics of 'views' per record per visitor per day
      data = result.rows[0];
    } else {
      throw new ErrNotFound('post not found');
    }

    if (with_assets && data) {
      // with side effect on data
      await find_attach_assets({ user, data: [ data ], parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.POST });
    }

    return { data };
  }

  async function article_search({ user, input }) {
    let data = [];
    // eslint-disable-next-line prefer-const
    let { q = '', offset = 0, limit = 10, with_assets = false } = input;
    offset = Number.parseInt(offset);
    limit = Number.parseInt(limit);
    if (100 < limit) limit = 100;
    // do not include large records e.g. avoid returning large text fields
    const text = 'SELECT a.id, a.slug, a.title, a.keywords, a.created_at, a.updated_at FROM ' + _.TBL_ARTICLE + ' a'
      + ' WHERE (a.title LIKE $1)'
      + '    OR (a.content LIKE $1)'
      + '    OR (a.keywords LIKE $1)'
      + ' ORDER BY a.title'
      + ' OFFSET $2'
      + ' LIMIT $3';
    const { result, error: findError } = await db.query(text, [`%${q}%`, offset, limit], 'article-text-search');
    if (findError) throw findError;
    data = result && result.rows ? result.rows : [];

    if (with_assets && data.length) {
      // with side effect on data
      await find_attach_assets({ user, data, parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.ARTICLE });
    }

    return { data };
  }

  async function article_retrieve({ user, id = null, input = { slug: '', with_assets: false} }) {
    // TODO: validate uuid
    // TODO: analytics of 'views' per record per visitor per day
    const { slug = '', with_assets = false } = input;
    if ((id && (id !== '')) || (slug && (slug !== ''))) {
      const condition = id ? { id } : { slug };
      const { row: data, error } = await db.find<IArticleDetailsModel>(_.TBL_ARTICLE, condition, 1);

      if (with_assets && data) {
        // with side effect on data
        await find_attach_assets({ user, data: [ data ], parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.ARTICLE });
      }

      return { data, error };
    } else {
      return { data: null, error: 'article id or slug required' };
    }
  }

  async function article_update({ user, id, input }) {
    // eslint-disable-next-line prefer-const
    let { slug, title, content, keywords } = input;
    const dt = new Date();

    const { row: articleFound, error: findArticleErr } = await db.find<IArticleDetailsModel>(_.TBL_ARTICLE, { id }, 1);
    if (findArticleErr) throw findArticleErr;
    if (!articleFound) throw new ErrNotFound(_.MSG_ARTICLE_NOT_FOUND);
    if (articleFound.created_by !== user.id) throw new ErrForbidden();

    if (!title) title = 'my article at ' + dt.toISOString();
    if (!slug) slug = title;
    slug = makeArticleSlug(slug);
    const change = updateRow({ slug, title, content, keywords, user });
    const { result, error: updateArticleError } = await db.update(_.TBL_ARTICLE, { id }, change, 1);
    if (!result || updateArticleError) throw updateArticleError;

    return { data: result && result.rowCount };
  }

  async function asset_create({ user, input }) {
    if (!user) throw new ErrForbidden();

    // TODO: validate input
    // eslint-disable-next-line prefer-const
    let { id = newUuid(), asset_type = null, media_type = null, label = null, url = null, meta = {} } = input;
    const row = newRow({ id, user, asset_type, media_type, label, url, meta });
    const { result, error } = await db.insert(_.TBL_ASSET, row);
    return { data: 0 < result.rowCount ? id : null, error };
  }

  async function asset_search({ user, input }) {
    let data = [];
    const { ids = [], offset = '0', limit = '100' } = input;
    let myOffset = Number.parseInt(offset);
    if (myOffset < 0) myOffset = 0;
    let myLimit = Number.parseInt(limit);
    if (100 < myLimit) myLimit = 100;
    const conditions = [];
    const params = [];
    if (ids.length) {
      conditions.push('a.id IN (' + ids.map(id => {
        params.push(id);
        return db.placeHolder(params.length);
      }) + ')');
    }
    params.push(offset);
    const offsetStr = ' OFFSET ' + db.placeHolder(params.length);
    params.push(limit);
    const limitStr = ' LIMIT ' + db.placeHolder(params.length);
    const whereStr = conditions.length ? ' WHERE (' + conditions.join(') AND (') + ')' : '';
    const text = 'SELECT a.* FROM ' + _.TBL_ASSET + ' a'
      + whereStr
      + ' ORDER BY a.created_at DESC' // TODO: ranking, relevance
      + offsetStr
      + limitStr;
    const preparedQryName = 'asset-search-' + hash(text);
    const { result, error: findError } = await db.query(text, params, preparedQryName);
    if (findError) throw findError;
    data = result && result.rows ? result.rows : [];
    return { data };
  }

  async function asset_delete({ user, id, input }) {
    // TODO: validate uuid
    // TODO: delete related records
    const { result, error } = await db.del(_.TBL_ASSET, { id }, 1);
    return { data: 0 < result.rowCount, error };
  }

  async function entity_asset_create({ user, input }) {
    if (!user) throw new ErrForbidden();

    // TODO: validate input
    // eslint-disable-next-line prefer-const
    let { parent_entity_kind = null, parent_entity_id = null, purpose = null, asset_id = null, meta = {} } = input;
    const id = newUuid();
    const row = newRow({
      id,
      user,
      parent_entity_kind, // posts, users, articles
      parent_entity_id,   // ref: posts.id or users.id ...
      purpose,  // 'user-profile-image'
      asset_id, // ref: assets.id
      meta,
    });
    const { result, error } = await db.insert(_.TBL_ENTITY_ASSET, row);
    return { data: 0 < result.rowCount ? id : null, error };
  }

  async function entity_asset_search({ user, input }) {
    let data = [];
    const { parent_entity_kind = null, parent_entity_ids = [], offset = '0', limit = '100' } = input;
    let myOffset = Number.parseInt(offset);
    if (myOffset < 0) myOffset = 0;
    let myLimit = Number.parseInt(limit);
    if (100 < myLimit) myLimit = 100;
    const conditions = [];
    const params = [];
    if (parent_entity_kind) {
      params.push(parent_entity_kind);
      conditions.push('parent_entity_kind = ' + db.placeHolder(params.length));
    }
    if (parent_entity_ids.length) {
      conditions.push('parent_entity_id IN (' + parent_entity_ids.map(peid => {
        params.push(peid);
        return db.placeHolder(params.length);
      }) + ')');
    }
    params.push(offset);
    const offsetStr = ' OFFSET ' + db.placeHolder(params.length);
    params.push(limit);
    const limitStr = ' LIMIT ' + db.placeHolder(params.length);
    const whereStr = conditions.length ? ' WHERE (' + conditions.join(') AND (') + ')' : '';
    const text = 'SELECT ea.*, row_to_json(a.*) AS asset '
      + ' FROM '+ _.TBL_ENTITY_ASSET + ' ea'
      + ' INNER JOIN ' + _.TBL_ASSET + ' a ON ea.asset_id = a.id '
      + whereStr
      + ' ORDER BY ea.created_at DESC' // TODO: ranking, relevance
      + offsetStr
      + limitStr;
    const preparedQryName = 'entity-asset-search-' + hash(text);
    const { result, error: findError } = await db.query(text, params, preparedQryName);
    if (findError) throw findError;
    data = result && result.rows ? result.rows : [];
    return { data };
  }

  async function entity_asset_delete({ user, id, input }) {
    // TODO: validate uuid
    // TODO: delete related records
    const { result, error } = await db.del(_.TBL_ENTITY_ASSET, { id }, 1);
    return { data: 0 < result.rowCount, error };
  }

  async function find_attach_assets({ user, data, parent_entity_kind = null }) {
    const { data: entityAssets } = await entity_asset_search({
      user,
      input: {
        parent_entity_kind,
        parent_entity_ids: data.map(r => r.id),
        limit: data.length,
      },
    });
    if (entityAssets) {
      entityAssets.forEach(eaRow => {
        const { parent_entity_id } = eaRow;
        const parentEntity = data.find(row => row.id === parent_entity_id);
        if (parentEntity) {
          if (!('assets' in parentEntity)) parentEntity.assets = []; // init assets array
          parentEntity.assets.push(eaRow);
        }
      });
    }
  }

  async function advert_create({ user, input }) {
    if (!user) throw new ErrForbidden();

    // TODO: validate input
    // eslint-disable-next-line prefer-const
    let { slug = '', title = '', content = '', tags = '', asset_id = null, is_buying = 0, is_service = 0 } = input;
    // eslint-disable-next-line prefer-const
    let { price = 0, currency = 'GBP', lat = 0, lon = 0, geo_accuracy = 9999 } = input;
    const now = new Date();
    
    const id = newUuid();
    if (!title) title = 'my advert';
    if (!slug) slug = title + now.toISOString();
    slug = makePostRef(slug);
    const row = newRow({
      id, user_id: user.id, user,
      slug, title, content, tags,
      is_buying, is_service, price, currency,
      lat, lon, geo_accuracy, geo_updated_at: now,
    });
    const { result, error } = await db.insert(_.TBL_ADVERT, row);
    if (asset_id) {
      try {
        const entityAssetInsertResult = await entity_asset_create({
          user,
          input: {
            parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.ADVERT,
            parent_entity_id: id,
            purpose: _.ENTITY_ASSET_PURPOSE.ADVERT_IMAGE,
            asset_id,
          },
        });
        log('entityAssetInsertResult success', entityAssetInsertResult);
      } catch (err) {
        log('entityAssetInsertResult error', err);
      }
    }
    return { data: 0 < result.rowCount ? id : null, error };
  }

  async function advert_retrieve({ user, id, input }) {
    // TODO: validate uuid
    // TODO: analytics of 'views' per record per visitor per day
    const { row: data, error } = await db.find(_.TBL_ADVERT, { id }, 1);
    return { data, error };
  }

  async function advert_update({ user, id, input }) {
    // TODO: validate inputs
    // eslint-disable-next-line prefer-const
    let { slug, title, content, tags, is_buying = 0, is_service = 0 } = input;
    // eslint-disable-next-line prefer-const
    let { price = 0, currency = 'GBP', lat = 0, lon = 0, geo_accuracy = 9999 } = input;
    const now = new Date();

    const { row: advertFound, error: findAdvertErr } = await db.find<IAdvertDetailsModel>(_.TBL_ADVERT, { id }, 1);
    if (findAdvertErr) throw findAdvertErr;
    if (!advertFound) throw new ErrNotFound(_.MSG_ADVERT_NOT_FOUND);
    if (advertFound.user_id !== user.id) throw new ErrForbidden(); // TODO: we can use postFound.created_by

    if (!title) title = 'my advert at ' + now.toISOString();
    if (!slug) slug = title;
    slug = makeAdvertRef(slug);
    const change = updateRow({
      user, slug, title, content, tags,
      is_buying, is_service, price, currency,
      lat, lon, geo_accuracy,
    });
    const { result, error: updateAdvertError } = await db.update(_.TBL_ADVERT, { id }, change, 1);
    if (!result || updateAdvertError) throw updateAdvertError;

    return { data: result && result.rowCount };
  }

  async function advert_delete({ user, id, input }) {
    // TODO: validate uuid
    // TODO: delete related records
    const { result, error } = await db.del(_.TBL_ADVERT, { id }, 1);
    return { data: 0 < result.rowCount, error };
  }

  async function advert_search({ user, input }: IAdvertSearchInput): IAdvertSearchOutput {
    let data = [], meta = null, ph = '';
    // eslint-disable-next-line prefer-const
    let { user_id = null, username = null, q = '', tag = '', min_price = '-1', max_price = '-1', offset = '0', limit = '10', with_assets = false } = input;
    const minPrice = Number.parseInt(min_price);
    const maxPrice = Number.parseInt(max_price);
    let myOffset = Number.parseInt(offset);
    if (myOffset < 0) myOffset = 0;
    let myLimit = Number.parseInt(limit);
    if (100 < myLimit) myLimit = 100;
    const conditions = [], params = [];
    if (user_id) {
      params.push(user_id);
      conditions.push('a.user_id = ' + db.placeHolder(params.length));
    }
    if (username) {
      params.push(username);
      conditions.push('u.username = ' + db.placeHolder(params.length));
    }
    if (q !== '') {
      params.push(`%${q}%`);
      ph = db.placeHolder(params.length); // TODO: use fulltext search
      conditions.push(`a.title LIKE ${ph} OR a.content LIKE ${ph}`);
    }
    if (tag !== '') {
      params.push(`%${tag}%`); // TODO: use tag index
      conditions.push('a.tags LIKE ' + db.placeHolder(params.length));
    }
    if (0 <= minPrice) {
      params.push(min_price);
      conditions.push(db.placeHolder(params.length) + ' <= a.price');
    }
    if (0 <= maxPrice) {
      params.push(max_price);
      conditions.push('a.price <= ' + db.placeHolder(params.length));
    }
    const whereStr = conditions.length ? ` WHERE (${conditions.join(') AND (')})` : '';
    
    const paramsNoPagination = [...params];

    params.push(myOffset);
    const offsetStr = ' OFFSET ' + db.placeHolder(params.length);
    params.push(myLimit);
    const limitStr = ' LIMIT ' + db.placeHolder(params.length);
    
    const textNoPagination = `
SELECT
  a.id, a.slug, a.title, a.tags, 
  a.is_buying, a.is_service, a.price, a.currency,
  a.created_at, a.user_id, u.username,
  a.lat, a.lon, a.geo_accuracy
FROM ${_.TBL_ADVERT} a
INNER JOIN ${_.TBL_USER} u ON a.user_id = u.id
${whereStr}
ORDER BY a.created_at DESC
`; // TODO: ranking, relevance
    
    const text = textNoPagination + offsetStr + limitStr;
    const qryName = 'adverts-text-search-' + hash(text);
    const { result, error: findError } = await db.query(text, params, qryName);
    if (findError) throw findError;
    data = result && result.rows ? result.rows : [];

    meta = await db.queryMeta(textNoPagination, paramsNoPagination, 'meta-' + qryName);

    if (with_assets && data.length) {
      // with side effect on data
      await find_attach_assets({ user, data, parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.ADVERT });
    }

    return { data, meta };
  }

  async function advert_search_by_user({ user, input = {} }) {
    // keeping this function for convenience
    // search by user_id/username included in advert_search()
    return advert_search({ user, input });
  }

  // use retrieve_advert(), it is faster
  async function advert_retrieve_by_username_and_slug({ user, input = { username: '', slug: '', with_assets: false } }) {
    let data = null;
    // eslint-disable-next-line prefer-const
    let { username = '', slug = '', with_assets = false } = input;
    username = username.toLowerCase();
    slug = slug.toLowerCase();
    const { row: advertOwner, error: userError } = await db.find<IUserPublic>(_.TBL_USER, { username }, 1);
    if (userError) throw userError;
    if (!advertOwner) throw new ErrNotFound('user not found');

    const text = 'SELECT * FROM ' + _.TBL_ADVERT
      + ' WHERE (user_id = $1) AND (slug = $2)';
    const { result, error: advertError } = await db.query(text, [advertOwner.id, slug], 'advert-by-user-and-ref');
    if (!result || advertError) throw advertError;
    if (result && result.rows && result.rows[0]) {
      // TODO: analytics of 'views' per record per visitor per day
      data = result.rows[0];
    } else {
      throw new ErrNotFound('advert not found');
    }

    if (with_assets && data) {
      // with side effect on data
      await find_attach_assets({ user, data: [ data ], parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.ADVERT });
    }

    return { data };
  }

  const actionsProtected = [
    'signout',
    'me',
    'user_retrieve_self',
    'usercontact_update',
    'usercontact_update_self',
    'usergeo_update',
    'usergeo_update_self',
    'verify_email_start',
    'verify_email_finish',
    'post_create', 'post_update', 'post_delete',
    'advert_create', 'advert_update', 'advert_delete',
    'article_update',
    'asset_create', 'asset_delete',
    'entity_asset_create', 'entity_asset_delete',
  ];
  const actionsForUser = [
    'usergeo_update',
    'usercontact_update',
  ];
  const actionsForSelf = [
    'me',
    'user_retrieve_self',
    'usergeo_update_self',
    'usercontact_update_self',
  ];
  const actionsForOwners = [
    'post_update',
    'post_delete',
    'article_update',
    'article_delete',
    'asset_delete',
    'entity_asset_delete',
    'advert_update',
    'advert_delete',
  ];

  function _isAllowed({ action = '', user = null, id = null, input = {}, rowFound = null, tokenError = null }) {
    let protect = false;
    if (actionsProtected.includes(action)) {
      protect = true;
      if (!user) { // required: user { id }
        if (tokenError) throw new ErrUnauthorized(tokenError);
        throw new ErrUnauthorized(); // early decision
      }
    }
    if (protect && actionsForUser.includes(action)) { // extra check
      if (user.id !== id) throw new ErrForbidden();
    }
    if (protect && actionsForSelf.includes(action)) { // extra check
      if (!user) throw new ErrForbidden();
    }
    if (protect && actionsForOwners.includes(action) && rowFound) { // extra check
      if (user.id !== rowFound.created_by) throw new ErrForbidden();
    }
    return !protect;
  }

  return {
    _isAllowed,

    echo,
    health,

    signup,
    signin,
    signout,
    user_retrieve_self,
    me: user_retrieve_self, // alias

    verify_email_start,
    verify_email_finish,

    user_search,
    user_retrieve,
    user_retrieve_by_username,
    usergeo_update,
    usergeo_update_self,
    usercontact_update,
    usercontact_update_self,

    post_create,
    post_search,
    post_search_by_user,
    post_retrieve,
    post_retrieve_by_username_and_slug,
    post_update,
    post_delete,

    advert_create,
    advert_search,
    advert_search_by_user,
    advert_retrieve,
    advert_retrieve_by_username_and_slug,
    advert_update,
    advert_delete,

    article_search,
    article_retrieve,
    article_update,

    asset_create,
    asset_search,
    asset_delete,

    entity_asset_create,
    entity_asset_search,
    entity_asset_delete,
  };
}

async function echo({ input }) {
  return Promise.resolve({ data: input, error: null });
}

async function health() {
  return Promise.resolve({ data: ts(), error: null });
}

export function normalize(slug = '') {
  let ref = slug.toLocaleLowerCase();
  if (ref === '') ref = ts();
  ref = ref.toLocaleLowerCase().replace(/[^a-z0-9]/g, '-');
  return ref;
}

export function makePostRef(slug = '') {
  return normalize(slug);
}

export function makeArticleSlug(slug = '') {
  return normalize(slug);
}

export function makeAdvertRef(slug = '') {
  return normalize(slug);
}

export function newRow({ user = null, id = newUuid(), dt = new Date(), ...rest }) {
  const by = user ? { created_by: user.id, updated_by: user.id } : {};
  return {
    id,
    created_at: dt,
    updated_at: dt,
    ...by,
    ...rest,
  };
}

export function updateRow({ user = null, dt = new Date(), ...rest }) {
  const by = user ? { updated_by: user.id } : {};
  return {
    updated_at: dt,
    ...by,
    ...rest,
  };
}
