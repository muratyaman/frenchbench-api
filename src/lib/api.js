import jwtManager from 'jsonwebtoken';
import * as _ from './constants';
import { ErrBadRequest, ErrForbidden, ErrNotFound, ErrUnauthorized } from './errors';
import { hash, log, newUuid, ts } from './utils';

export function newApi({ config, db, securityMgr }) {

  async function echo({ input }) {
    return Promise.resolve({ data: input, error: null });
  }

  async function health() {
    return Promise.resolve({ data: ts(), error: null });
  }

  async function signup({ input }) {
    let data = null, error = null;
    try {
      let { username = '', password = '', password_confirm = '' } = input;
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
      const id = newUuid(), dt = new Date();
      const userRow = {
        id,
        created_at: dt,
        updated_at: dt,
        username,
        password_hash,
      };
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

  async function signin({ input }) {
    let data = null, token = null, error = _.MSG_INVALID_CREDENTIALS;

    let { username = '', password = '' } = input;
    username.trim().toLowerCase();
    if (!(username && username !== '' && password && password !== '')) throw new Error(error);

    const { row: found, error: userLookupError } = await db.find(_.TBL_USER, { username }, 1);
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

  async function signout() {
    return { data: { token: 'x' }, error: null }; // side-effect ==> invalid cookie on browser
  }

  // we can use user_retrieve
  async function user_retrieve_self({ user = {} }) {
    const { id = null } = user ?? {};
    if (id) {
      const { row, error } = await db.find(_.TBL_USER, { id }, 1);
      const data = securityMgr.hideSensitiveUserProps(row);
      return { data, error };
    } else {
      log('user_retrieve_self: user id is null');
      return { data: null, error: 'user id is null' };
    }
  }

  async function user_retrieve({ user, id = null }) {
    let data = null, error = null;
    // TODO: analytics of 'views' per record per visitor per day
    const condition = { id };
    if (!id) throw new ErrBadRequest(_.MSG_ID_REQUIRED);
    const { row, error: findUserError } = await db.find(_.TBL_USER, condition, 1);
    if (findUserError) throw findUserError;
    data = securityMgr.hideSensitiveUserProps(row);
    return { data, error };
  }

  async function user_retrieve_by_username({ user, input = {} }) {
    let data = null, error = null;
    // TODO: analytics of 'views' per record per visitor per day
    const { username = null } = input;
    if (!username) throw new ErrBadRequest(_.MSG_USERNAME_REQUIRED);
    const condition = { username };
    const { row, error: findUserError } = await db.find(_.TBL_USER, condition, 1);
    if (findUserError) throw findUserError;
    data = securityMgr.hideSensitiveUserProps(row);
    return { data, error };
  }

  async function user_search({ user, input = {} }) {
    let data = [], error = null;
    let { lat1 = 0, lon1 = 0, lat2 = 0, lon2 = 0, with_assets = false } = input;
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
      await find_attach_assets({ user, data, parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.user });
    }

    return { data, error };
  }

  async function usercontact_update({ user, id, input }) {
    // permission is checked by _isProtected()
    // let { first_name, last_name, email, phone, headline, neighbourhood } = input;
    let change = { ...input, updated_at: new Date() }; // TODO: limit inputs?
    const condition = { id }; // TODO: for now, only user himself can update
    let { result, error } = await db.update(_.TBL_USER, condition, change, 1);
    return { data: result && result.rowCount, error };
  }

  async function usercontact_update_self({ user, input }) {
    // permission is checked by _isProtected()
    // let { first_name, last_name, email, phone, headline, neighbourhood } = input;
    let change = { ...input, updated_at: new Date() }; // TODO: limit inputs?
    const condition = { id: user.id }; // TODO: for now, only user himself can update
    let { result, error } = await db.update(_.TBL_USER, condition, change, 1);
    return { data: result && result.rowCount, error };
  }

  async function usergeo_update({ user, id, input }) {
    // permission is checked by _isProtected()
    let { lat, lon, raw_geo } = input;
    let change = { lat, lon, raw_geo, updated_at: new Date() };
    const condition = { id }; // TODO: for now, only user himself can update
    let { result, error } = await db.update(_.TBL_USER, condition, change, 1);
    return { data: result && result.rowCount, error };
  }

  async function usergeo_update_self({ user, input }) {
    // permission is checked by _isProtected()
    let { lat, lon, raw_geo } = input;
    let change = { lat, lon, raw_geo, updated_at: new Date() };
    const condition = { id: user.id }; // TODO: for now, only user himself can update
    let { result, error } = await db.update(_.TBL_USER, condition, change, 1);
    return { data: result && result.rowCount, error };
  }

  function makePostRef(post_ref = '') {
    let ref = post_ref.toLocaleLowerCase();
    if (ref === '') ref = (new Date()).toISOString();
    ref = ref.toLocaleLowerCase().replace(/[^a-z0-9]/g, '-');
    return ref;
  }

  async function post_create({ user, input }) {
    if (!user) throw new ErrForbidden();

    let { post_ref = '', title = '', content = '', tags = '', asset_id = null } = input;
    const dt = new Date();
    const id = newUuid();
    if (!title) title = 'my post';
    if (!post_ref) post_ref = title + dt.toISOString();
    post_ref = makePostRef(post_ref);
    const row = {
      id,
      created_at: dt,
      updated_at: dt,
      user_id: user.id,
      created_by: user.id,
      updated_by: user.id,
      post_ref,
      title,
      content,
      tags,
    };
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

  async function post_retrieve({ user, id, input }) {
    // TODO: validate uuid
    // TODO: analytics of 'views' per record per visitor per day
    const { row: data, error } = await db.find(_.TBL_POST, { id }, 1);
    return { data, error };
  }

  async function post_update({ user, id, input }) {
    let error = null;

    let { post_ref, title, content, tags } = input;
    const dt = new Date();

    const { row: postFound, error: findPostErr } = await db.find(_.TBL_POST, { id }, 1);
    if (findPostErr) throw findPostErr;
    if (!postFound) throw new ErrNotFound(_.MSG_POST_NOT_FOUND);
    if (postFound.user_id !== user.id) throw new ErrForbidden(); // TODO: we can use created_at

    if (!title) title = 'my post at ' + dt.toISOString();
    if (!post_ref) post_ref = title;
    post_ref = makePostRef(post_ref);
    let change = { post_ref, title, content, tags, updated_at: dt, updated_by: user.id, };
    let { result, error: updatePostError } = await db.update(_.TBL_POST, { id }, change, 1);
    if (updatePostError) throw updatePostError;

    return { data: result && result.rowCount, error };
  }

  async function post_delete({ user, id, input }) {
    // TODO: validate uuid
    // TODO: delete related records
    const { result, error } = await db.del(_.TBL_POST, { id }, 1);
    return { data: 0 < result.rowCount, error };
  }

  async function post_search({ user, input }) {
    let data = [], error = null, ph = '';
    let { q = '', tag = '', offset = 0, limit = 10, with_assets = false } = input;
    offset = Number.parseInt(offset);
    limit = Number.parseInt(limit);
    if (100 < limit) limit = 100;
    const conditions = [], params = [];
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
    params.push(offset);
    const offsetStr = ' OFFSET ' + db.placeHolder(params.length);
    params.push(limit);
    const limitStr = ' LIMIT ' + db.placeHolder(params.length);
    const text = 'SELECT p.id, p.post_ref, p.title, p.tags, p.created_at, u.username FROM ' + _.TBL_POST + ' p'
      + ' INNER JOIN ' + _.TBL_USER + ' u ON p.user_id = u.id'
      + whereStr
      + ' ORDER BY p.created_at DESC' // TODO: ranking, relevance
      + offsetStr
      + limitStr;
    const { result, error: findError } = await db.query(text, params, 'posts-text-search-' + hash(text));
    if (findError) throw findError;
    data = result && result.rows ? result.rows : [];

    if (with_assets && data.length) {
      // with side effect on data
      await find_attach_assets({ user, data, parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.post });
    }

    return { data, error };
  }

  async function post_search_by_user({ user, input = {} }) {
    let data = [], error = null;
    let { user_id = null, username = null, q = '', offset = 0, limit = 10, with_assets = false } = input;
    offset = Number.parseInt(offset);
    limit = Number.parseInt(limit);
    if (100 < limit) limit = 100;
    if (!user_id && username) {
      const { row: postOwner, error: userError } = await db.find(_.TBL_USER, { username }, 1);
      if (userError) throw userError;
      if (!postOwner) throw new ErrNotFound(_.MSG_USER_NOT_FOUND);
      user_id = postOwner.id;
    }
    if (user_id && !username) {
      const { row: postOwner2, error: userError2 } = await db.find(_.TBL_USER, { id: user_id }, 1);
      if (userError2) throw userError2;
      if (!postOwner2) throw new ErrNotFound('user not found');
      username = postOwner2.username;
    }
    if (!user_id) throw new ErrBadRequest('user_id or username is required');
    const text = 'SELECT id, post_ref, title, tags, created_at FROM ' + _.TBL_POST
      + ' WHERE user_id = $1'
      + ' ORDER BY created_at DESC'
      + ' OFFSET $2'
      + ' LIMIT $3';
    const { result, error: findError } = await db.query(text, [user_id, offset, limit], 'posts-by-user');
    if (findError) throw findError;
    data = result && result.rows ? result.rows.map(row => ({ ...row, username })) : []; // enrich with username

    if (with_assets && data.length) {
      // with side effect on data
      await find_attach_assets({ user, data, parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.post });
    }

    return { data, error };
  }

  // use retrieve_post(), it is faster
  async function post_retrieve_by_username_and_post_ref({ user, input = {} }) {
    let data = null, error = null;
    let { username = '', post_ref = '', with_assets = false } = input;
    username = username.toLowerCase();
    post_ref = post_ref.toLowerCase();
    const { row: postOwner, error: userError } = await db.find(_.TBL_USER, { username }, 1);
    if (userError) throw userError;
    if (!postOwner) throw new ErrNotFound('user not found');

    const text = 'SELECT * FROM ' + _.TBL_POST
      + ' WHERE (user_id = $1) AND (post_ref = $2)';
    const { result, error: postError } = await db.query(text, [postOwner.id, post_ref], 'post-by-user-and-ref');
    if (postError) throw postError;
    if (result && result.rows && result.rows[0]) {
      // TODO: analytics of 'views' per record per visitor per day
      data = result.rows[0];
    } else {
      throw new ErrNotFound('post not found');
    }

    if (with_assets && data) {
      // with side effect on data
      await find_attach_assets({ user, data: [ data ], parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.post });
    }

    return { data, error };
  }

  async function article_search({ user, input }) {
    let data = [], error = null;
    let { q = '', offset = 0, limit = 10, with_assets = false } = input;
    offset = Number.parseInt(offset);
    limit = Number.parseInt(limit);
    if (100 < limit) limit = 100;
    // do not include large records e.g. avoid returning large text fields
    const text = 'SELECT a.id, a.slug, a.title, keywords FROM ' + _.TBL_ARTICLE + ' a'
      + ' WHERE (a.title LIKE $1)'
      + '    OR (a.content LIKE $1)'
      + '    OR (a.keywords LIKE $1)'
      + ' ORDER BY a.created_at DESC'
      + ' OFFSET $2'
      + ' LIMIT $3';
    const { result, error: findError } = await db.query(text, [`%${q}%`, offset, limit], 'article-text-search');
    if (findError) throw findError;
    data = result && result.rows ? result.rows : [];

    if (with_assets && data.length) {
      // with side effect on data
      await find_attach_assets({ user, data, parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.article });
    }

    return { data, error };
  }

  async function article_retrieve({ user, id = null, input = {} }) {
    // TODO: validate uuid
    // TODO: analytics of 'views' per record per visitor per day
    const { slug = null, with_assets = false } = input;
    if (id || slug) {
      const condition = id ? { id } : { slug };
      const { row: data, error } = await db.find(_.TBL_ARTICLE, condition, 1);

      if (with_assets && data) {
        // with side effect on data
        await find_attach_assets({ user, data: [ data ], parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.article });
      }

      return { data, error };
    } else {
      return { data: null, error: 'article id or slug required' };
    }
  }

  async function asset_create({ user, input }) {
    if (!user) throw new ErrForbidden();

    let { id = newUuid(), asset_type = null, media_type = null, label = null, url = null, meta = {} } = input;
    const dt = new Date();
    const row = {
      id,
      created_at: dt,
      updated_at: dt,
      created_by: user.id,
      updated_by: user.id,
      asset_type,
      media_type,
      label,
      url,
      meta,
    };
    const { result, error } = await db.insert(_.TBL_ASSET, row);
    return { data: 0 < result.rowCount ? id : null, error };
  }

  async function asset_search({ user, input }) {
    let data = [], error = null;
    let { ids = [], offset = 0, limit = 10 } = input;
    offset = Number.parseInt(offset);
    limit = Number.parseInt(limit);
    if (100 < limit) limit = 100;
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
    const preparedQryName = 'asset-search-' + md5(text);
    const { result, error: findError } = await db.query(text, params, preparedQryName);
    if (findError) throw findError;
    data = result && result.rows ? result.rows : [];
    return { data, error };
  }

  async function asset_delete({ user, id, input }) {
    // TODO: validate uuid
    // TODO: delete related records
    const { result, error } = await db.del(_.TBL_ASSET, { id }, 1);
    return { data: 0 < result.rowCount, error };
  }

  async function entity_asset_create({ user, input }) {
    if (!user) throw new ErrForbidden();

    let { parent_entity_kind = null, parent_entity_id = null, purpose = null, asset_id = null, meta = {} } = input;
    const dt = new Date();
    const id = newUuid();
    const row = {
      id,
      created_at: dt,
      updated_at: dt,
      created_by: user.id,
      updated_by: user.id,
      parent_entity_kind, // posts, users, articles
      parent_entity_id,   // ref: posts.id or users.id ...
      purpose,  // 'user-profile-image'
      asset_id, // ref: assets.id
      meta,
    };
    const { result, error } = await db.insert(_.TBL_ENTITY_ASSET, row);
    return { data: 0 < result.rowCount ? id : null, error };
  }

  async function entity_asset_search({ user, input }) {
    let data = [], error = null;
    let { parent_entity_kind = null, parent_entity_ids = [], offset = 0, limit = 10 } = input;
    offset = Number.parseInt(offset);
    limit = Number.parseInt(limit);
    if (100 < limit) limit = 100;
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
    return { data, error };
  }

  async function entity_asset_delete({ user, id, input }) {
    // TODO: validate uuid
    // TODO: delete related records
    const { result, error } = await db.del(_.TBL_ENTITY_ASSET, { id }, 1);
    return { data: 0 < result.rowCount, error };
  }

  async function find_attach_assets({ user, data, parent_entity_kind = null }) {
    const { data: entityAssets, error: entityAssetErr } = await entity_asset_search({
      user,
      input: {
        parent_entity_kind,
        parent_entity_ids: data.map(r => r.id),
        limit: data.length,
      },
    });
    if (entityAssetErr) {
      log('find_attach_assets', entityAssetErr);
    }
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

  const actionsProtected = [
    'signout',
    'user_retrieve_self',
    'usercontact_update',
    'usercontact_update_self',
    'usergeo_update',
    'usergeo_update_self',
    'post_create', 'post_update', 'post_delete',
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
  const actionsForOwners = ['post_update', 'asset_delete', 'entity_asset_delete'];

  function _isAllowed({ action = '', user = null, id = null, input = {}, rowFound = null }) {
    let protect = false;
    if (actionsProtected.includes(action)) {
      protect = true;
      if (!user) throw new ErrUnauthorized(); // early decision
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
    post_retrieve_by_username_and_post_ref,
    post_update,
    post_delete,

    article_search,
    article_retrieve,

    asset_create,
    asset_search,
    asset_delete,

    entity_asset_create,
    entity_asset_search,
    entity_asset_delete,
  };
}
