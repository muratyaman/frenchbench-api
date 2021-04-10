import * as _ from '../constants';
import * as at from '../apiTypes';
import * as dm from '../dbModels';
import { IDb } from '../db';
import { ErrForbidden, ErrNotFound } from '../errors';
import { hash, log, makePostSlug, newRow, newUuid, updateRow } from '../utils';
import { AssetService } from './AssetService';
import { UserService } from './UserService';

export class PostService {

  constructor(
    private db: IDb,
    private assetService: AssetService,
    private userService: UserService,
  ) {

  }

  async post_create({ user, input }: at.PostCreateInput): at.PostCreateOutput {
    if (!user) throw new ErrForbidden();

    // eslint-disable-next-line prefer-const
    let { slug = '', title = '', content = '', tags = '', asset_id = null, lat = 0, lon = 0, geo_accuracy = 9999 } = input;
    const now = new Date();
    const id = newUuid();
    if (!title) title = 'my post';
    if (!slug) slug = title + now.toISOString();
    slug = makePostSlug(slug);
    const row = newRow({
      id, user_id: user.id, user,
      slug, title, content, tags,
      lat, lon, geo_accuracy, geo_updated_at: now,
    });
    const { result, error } = await this.db.insert(_.TBL_POST, row);
    if (asset_id) {
      try {
        await this.assetService.entity_asset_create({
          user,
          input: {
            parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.POST,
            parent_entity_id: id,
            purpose: _.ENTITY_ASSET_PURPOSE.POST_IMAGE,
            asset_id,
          },
        });
      } catch (err) {
        log('entity_asset_create error', err);
      }
    }
    return { data: result.success ? id : null, error };
  }

  async post_retrieve({ user, id, input }: at.PostRetrieveInput): at.PostRetrieveOutput {
    // TODO: validate uuid
    // TODO: analytics of 'views' per record per visitor per day
    const { with_assets = false, with_owner = false } = input;
    const { row, error: postErr } = await this.db.find<dm.Post>(_.TBL_POST, { id }, 1);
    if (!row || postErr) throw new ErrNotFound();
    if (with_assets) {
      // side effects on data
      await this.assetService.find_attach_assets({ user, data: [ row ], parent_entity_kind: dm.EntityKindEnum.POSTS });
    }
    if (with_owner) {
      const { data: owner } = await this.userService.user_retrieve({ id: row.user_id }); // will throw err
      row['owner'] = owner;
    }
    return { data: row };
  }

  async post_update({ user, id, input }: at.PostUpdateInput): at.PostUpdateOutput {
    // eslint-disable-next-line prefer-const
    let { slug, title, content, tags, lat = 0, lon = 0, geo_accuracy = 9999 } = input;
    const now = new Date();

    const { row: postFound, error: findPostErr } = await this.db.find<dm.Post>(_.TBL_POST, { id }, 1);
    if (findPostErr) throw findPostErr;
    if (!postFound) throw new ErrNotFound(_.MSG_POST_NOT_FOUND);
    if (postFound.user_id !== user.id) throw new ErrForbidden(); // TODO: we can use postFound.created_by

    if (!title) title = 'my post at ' + now.toISOString();
    if (!slug) slug = title;
    slug = makePostSlug(slug);
    const change = updateRow({
      user,
      slug, title, content, tags,
      lat, lon, geo_accuracy,
    });
    const { result, error: updatePostError } = await this.db.update(_.TBL_POST, { id }, change, 1);
    if (updatePostError) throw updatePostError;

    return { data: result.success };
  }

  async post_delete({ id }: at.PostDeleteInput): at.PostDeleteOutput {
    // TODO: validate uuid
    // TODO: delete related records
    const { result, error } = await this.db.del(_.TBL_POST, { id }, 1);
    return { data: result.success, error };
  }

  async post_search({ user, input }: at.PostSearchInput): at.PostSearchOutput {
    let data: at.PostSummary[] = [], ph = '';
    // eslint-disable-next-line prefer-const
    let { user_id = null, username = null, q = '', tag = '', offset = '0', limit = '10', with_assets = false } = input;

    let myOffset = Number.parseInt(`${offset}`);
    if (myOffset < 0) myOffset = 0;
    let myLimit = Number.parseInt(`${limit}`);
    if (100 < myLimit) myLimit = 100;

    const conditions = [], params = [];
    if (user_id) {
      params.push(user_id);
      conditions.push('p.user_id = ' + this.db.placeHolder(params.length));
    }
    if (username) {
      params.push(username);
      conditions.push('u.username = ' + this.db.placeHolder(params.length));
    }
    if (q !== '') {
      params.push(`%${q}%`);
      ph = this.db.placeHolder(params.length); // TODO: use fulltext search
      conditions.push(`p.title LIKE ${ph} OR p.content LIKE ${ph}`);
    }
    if (tag !== '') {
      params.push(`%${tag}%`); // TODO: use tag index
      conditions.push('p.tags LIKE ' + this.db.placeHolder(params.length));
    }
    const whereStr = conditions.length ? ` WHERE (${conditions.join(') AND (')})` : '';
    
    const paramsNoPagination = [...params];

    params.push(myOffset);
    const offsetStr = ' OFFSET ' + this.db.placeHolder(params.length);
    params.push(myLimit);
    const limitStr = ' LIMIT ' + this.db.placeHolder(params.length);

    const textNoPagination = `
SELECT
  p.id, p.slug, p.title, p.tags, p.created_at, p.user_id, u.username, p.lat, p.lon, p.geo_accuracy
FROM ${_.TBL_POST} p
INNER JOIN ${_.TBL_USER} u ON p.user_id = u.id
${whereStr}
ORDER BY p.created_at DESC
`; // TODO: ranking, relevance
    
    const text = textNoPagination + offsetStr + limitStr;
    const qryName = 'posts-text-search-' + hash(text);
    const { result, error: findError } = await this.db.query<at.PostSummary>(text, params);
    if (findError) throw findError;
    data = result && result.rows ? result.rows : [];

    const meta = await this.db.queryMeta(textNoPagination, paramsNoPagination, 'meta-' + qryName);

    if (with_assets && data.length) {
      // with side effect on data
      await this.assetService.find_attach_assets({ user, data, parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.POST });
    }

    return { data, meta };
  }

  // use retrieve_post(), it is faster
  async post_retrieve_by_username_and_slug({ user, input }: at.PostRetrieveInput): at.PostRetrieveOutput {
    let data = null;
    // eslint-disable-next-line prefer-const
    let { username = '', slug = '', with_assets = false } = input;
    username = username.toLowerCase();
    slug = slug.toLowerCase();
    const { row: owner, error: userError } = await this.db.find<dm.User>(_.TBL_USER, { username }, 1);
    if (userError) throw userError;
    if (!owner) throw new ErrNotFound('user not found');

    const text = 'SELECT * FROM ' + _.TBL_POST + ' WHERE (user_id = $1) AND (slug = $2)';
    const { result, error: postError } = await this.db.query(text, [owner.id, slug], 'post-by-user-and-slug');
    if (postError) throw postError;
    if (result && result.rows && result.rows[0]) {
      // TODO: analytics of 'views' per record per visitor per day
      data = result.rows[0];
    } else {
      throw new ErrNotFound('post not found');
    }

    if (with_assets && data) {
      // with side effect on data
      await this.assetService.find_attach_assets({ user, data: [ data ], parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.POST });
    }
    data['owner'] = owner;

    return { data };
  }

  _api() {
    return {
      post_create: this.post_create,
      post_delete: this.post_delete,
      post_retrieve: this.post_retrieve,
      post_retrieve_by_username_and_slug: this.post_retrieve_by_username_and_slug,
      post_search: this.post_search,
      post_update: this.post_update,
    };
  }
}
