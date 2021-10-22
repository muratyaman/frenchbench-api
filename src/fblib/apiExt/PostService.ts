import * as _ from '../constants';
import * as at from '../apiTypes';
import * as dm from '../dbModels';
import { DbService } from '../DbService';
import { ErrForbidden } from '../errors';
import { hash, log, makePostSlug, newRow, newUuid, updateRow } from '../utils';
import { AssetService } from './AssetService';
import { UserService } from './UserService';

export class PostService {
  constructor(
    private db: DbService,
    private assetService: AssetService,
    private userService: UserService,
  ) {
    // do nothing
  }

  async post_create({ user, input }: at.PostCreateInput): Promise<at.PostCreateOutput> {
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
        await this.assetService._entity_asset_create_post_image(user, id, asset_id);
      } catch (err) {
        log('entity_asset_create error', err);
      }
    }
    return { data: result.success ? id : null, error };
  }

  async post_retrieve({ user, id, input }: at.PostRetrieveInput): Promise<at.PostRetrieveOutput> {
    // TODO: validate uuid
    // TODO: analytics of 'views' per record per visitor per day
    const { with_assets = false, with_owner = true } = input;
    const row = await this.db.findOneOrErr<dm.Post>(_.TBL_POST, { id }, _.MSG_POST_NOT_FOUND);
    if (with_assets) {
      // side effects on data
      await this.assetService._find_attach_assets({ user, data: [ row ], parent_entity_kind: dm.EntityKindEnum.POSTS });
    }
    if (with_owner) {
      const { data: owner } = await this.userService.user_retrieve({ id: row.user_id }); // will throw err
      row['owner'] = owner;
    }
    return { data: row };
  }

  // use retrieve_post(), it is faster
  async post_retrieve_by_username_and_slug({ user, input }: at.PostRetrieveInput): Promise<at.PostRetrieveOutput> {
    // eslint-disable-next-line prefer-const
    let { username = '', slug = '', with_assets = false, with_owner = true } = input;
    username = username.toLowerCase();
    slug = slug.toLowerCase();

    const { data: owner } = await this.userService.user_retrieve_by_username({ input: { username }}); // will throw err
    
    const row = await this.db.findOneOrErr<dm.Post>(_.TBL_POST, { user_id: owner.id, slug }, _.MSG_POST_NOT_FOUND);

    if (with_owner) row['owner'] = owner;
    
    if (with_assets) {
      // with side effect on data
      await this.assetService._find_attach_assets({ user, data: [ row ], parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.POST });
    }

    return { data: row };
  }

  async post_update({ user, id, input }: at.PostUpdateInput): Promise<at.PostUpdateOutput> {
    // eslint-disable-next-line prefer-const
    let { slug, title, content, tags, lat = 0, lon = 0, geo_accuracy = 9999 } = input;
    const now = new Date();

    const { data: found } = await this.post_retrieve({ user, id });
    if (found.user_id !== user.id) throw new ErrForbidden(); // TODO: we can use found.created_by

    if (!title) title = 'my post at ' + now.toISOString();
    if (!slug) slug = title;
    slug = makePostSlug(slug);
    const change = updateRow({ user, slug, title, content, tags, lat, lon, geo_accuracy });
    const { result, error } = await this.db.update(_.TBL_POST, { id }, change, 1);
    return { data: result.success, error };
  }

  async post_delete({ user, id }: at.PostDeleteInput): Promise<at.PostDeleteOutput> {
    // TODO: validate uuid
    // TODO: delete related records
    const { data: found } = await this.post_retrieve({ user, id });
    if (found.user_id !== user.id) throw new ErrForbidden(); // TODO: we can use found.created_by

    const { result, error } = await this.db.del(_.TBL_POST, { id }, 1);
    return { data: result.success, error };
  }

  async post_search({ user, input }: at.PostSearchInput): Promise<at.PostSearchOutput> {
    let data: at.PostSummary[] = [], ph = '';
    // eslint-disable-next-line prefer-const
    let { user_id = null, username = null, q = '', tag = '', with_assets = false } = input;

    const conditions = [], params = [];
    if (user_id) {
      params.push(user_id);
      conditions.push('p.user_id = ' + this.db.ph(params.length));
    }
    if (username) {
      params.push(username);
      conditions.push('u.username = ' + this.db.ph(params.length));
    }
    if (q !== '') {
      params.push(`%${q}%`);
      ph = this.db.ph(params.length); // TODO: use fulltext search
      conditions.push(`p.title LIKE ${ph} OR p.content LIKE ${ph}`);
    }
    if (tag !== '') {
      params.push(`%${tag}%`); // TODO: use tag index
      conditions.push('p.tags LIKE ' + this.db.ph(params.length));
    }
    const whereStr = conditions.length ? ` WHERE (${conditions.join(') AND (')})` : '';
    
    const paramsNoPagination = [...params];

    const textNoPagination = `
SELECT
  p.id, p.slug, p.title, p.tags, p.created_at, p.user_id, u.username, p.lat, p.lon, p.geo_accuracy
FROM ${_.TBL_POST} p
INNER JOIN ${_.TBL_USER} u ON p.user_id = u.id
${whereStr}
ORDER BY p.created_at DESC
`; // TODO: ranking, relevance
    
    const pagination = this.db.paginate(input, 100);
    const { offsetClause, limitClause } = this.db.paginationClauses(pagination, params);

    const text = textNoPagination + offsetClause + limitClause;
    const qryName = 'post-text-search-' + hash(text);
    const { result, error: findError } = await this.db.query<at.PostSummary>(text, params);
    if (findError) throw findError;
    data = result && result.rows ? result.rows : [];

    const meta = await this.db.queryMeta(textNoPagination, paramsNoPagination, 'meta-' + qryName);

    if (with_assets && data.length) {
      // with side effect on data
      await this.assetService._find_attach_assets({ user, data, parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.POST });
    }

    return { data, meta };
  }

  _api() {
    return {
      post_create: this,
      post_delete: this,
      post_retrieve: this,
      post_retrieve_by_username_and_slug: this,
      post_search: this,
      post_update: this,
    };
  }
}
