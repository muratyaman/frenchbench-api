import * as _ from '../constants';
import * as at from '../apiTypes';
import * as dm from '../dbModels';
import { DbService } from '../DbService';
import { ErrForbidden, ErrNotFound } from '../errors';
import { hash, log, makeAdvertSlug, makePostSlug, newRow, newUuid, updateRow } from '../utils';
import { AssetService } from './AssetService';
import { UserService } from './UserService';

export class AdvertService {
  constructor(
    private db: DbService,
    private assetService: AssetService,
    private userService: UserService,
  ) {
    // do nothing
  }

  async advert_create({ user, input }: at.AdvertCreateInput): Promise<at.AdvertCreateOutput> {
    // TODO: validate input
    // eslint-disable-next-line prefer-const
    let { slug = '', title = '', content = '', tags = '', asset_id = null, is_buying = 0, is_service = 0 } = input;
    // eslint-disable-next-line prefer-const
    let { price = 0, currency = 'GBP', lat = 0, lon = 0, geo_accuracy = 9999 } = input;
    const now = new Date();
    
    const id = newUuid();
    if (!title) title = 'my advert';
    if (!slug) slug = title + now.toISOString();
    slug = makePostSlug(slug);
    const row = newRow({
      id, user_id: user.id, user,
      slug, title, content, tags,
      is_buying, is_service, price, currency,
      lat, lon, geo_accuracy, geo_updated_at: now,
    });
    const { result, error } = await this.db.insert(_.TBL_ADVERT, row);
    if (asset_id) {
      try {
        await this.assetService._entity_asset_create_advert_image(user, id, asset_id);
      } catch (err) {
        log('entityAssetInsertResult error', err);
      }
    }
    return { data: result.success ? id : null, error };
  }

  async advert_retrieve({ user, id, input }: at.AdvertRetrieveInput): Promise<at.AdvertRetrieveOutput> {
    // TODO: validate uuid
    // TODO: analytics of 'views' per record per visitor per day
    const { with_assets = false, with_owner = true } = input;

    const row = await this.db.findOneOrErr<dm.Advert>(_.TBL_ADVERT, { id }, _.MSG_ADVERT_NOT_FOUND);

    if (with_assets) {
      // with side effect on data
      await this.assetService._find_attach_assets<dm.Advert>({ user, data: [ row ], parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.ADVERT });
    }
    if (with_owner) {
      const res = await this.userService.user_retrieve({ id: row.user_id }); // will throw err
      row['owner'] = res.data;
    }
    return { data: row };
  }

  // use retrieve_advert(), it is faster
  async advert_retrieve_by_username_and_slug({ user, input }: at.AdvertRetrieveInput): Promise<at.AdvertRetrieveOutput> {
    // eslint-disable-next-line prefer-const
    let { username = '', slug = '', with_assets = false, with_owner = true } = input;
    username = username.toLowerCase();
    slug = slug.toLowerCase();

    const { data: owner } = await this.userService.user_retrieve_by_username({ input: { username }}); // will throw err

    const row = await this.db.findOneOrErr<dm.Advert>(_.TBL_ADVERT, { user_id: owner.id, slug }, _.MSG_ADVERT_NOT_FOUND);

    if (with_owner) row['owner'] = owner;

    if (with_assets) {
      // with side effect on data
      await this.assetService._find_attach_assets({ user, data: [ row ], parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.ADVERT });
    }

    return { data: row };
  }

  async advert_update({ user, id, input }: at.AdvertUpdateInput): Promise<at.AdvertUpdateOutput> {
    // TODO: validate inputs
    // eslint-disable-next-line prefer-const
    let { slug, title, content, tags, is_buying = 0, is_service = 0 } = input;
    // eslint-disable-next-line prefer-const
    let { price = 0, currency = 'GBP', lat = 0, lon = 0, geo_accuracy = 9999 } = input;
    const now = new Date();

    const { data: found } = await this.advert_retrieve({ user, id });
    if (found.user_id !== user.id) throw new ErrForbidden(); // TODO: we can use found.created_by

    if (!title) title = 'my advert at ' + now.toISOString();
    if (!slug) slug = title;
    slug = makeAdvertSlug(slug);
    const change = updateRow({ user, slug, title, content, tags, lat, lon, geo_accuracy, is_buying, is_service, price, currency });
    const { result, error } = await this.db.update(_.TBL_ADVERT, { id }, change, 1);
    return { data: result.success, error };
  }

  async advert_delete({ user, id }: at.AdvertDeleteInput): Promise<at.AdvertDeleteOutput> {
    const { data: found } = await this.advert_retrieve({ user, id });
    if (found.user_id !== user.id) throw new ErrForbidden(); // TODO: we can use found.created_by

    // TODO: delete related records
    const { result, error } = await this.db.del(_.TBL_ADVERT, { id }, 1);
    return { data: result.success, error };
  }

  async advert_search({ user, input }: at.AdvertSearchInput): Promise<at.AdvertSearchOutput> {
    let data = [], ph = '';
    // eslint-disable-next-line prefer-const
    let { user_id = null, username = null, q = '', tag = '', min_price = '-1', max_price = '-1', with_assets = false } = input;
    const minPrice = Number.parseInt(`${min_price}`);
    const maxPrice = Number.parseInt(`${max_price}`);

    const conditions = [], params = [];
    if (user_id) {
      conditions.push('a.user_id = ' + this.db.param(params, user_id));
    }
    if (username) {
      conditions.push('u.username = ' + this.db.param(params, username));
    }
    if (q !== '') {
      ph = this.db.param(params, `%${q}%`); // TODO: use fulltext search
      conditions.push(`a.title LIKE ${ph} OR a.content LIKE ${ph}`);
    }
    if (tag !== '') {
      conditions.push('a.tags LIKE ' + this.db.param(params, `%${tag}%`)); // TODO: use tag index
    }
    if (0 <= minPrice) {
      conditions.push(this.db.param(params, minPrice) + ' <= a.price');
    }
    if (0 <= maxPrice) {
      conditions.push('a.price <= ' + this.db.param(params, maxPrice));
    }
    const whereStr = conditions.length ? ` WHERE (${conditions.join(') AND (')})` : '';
    
    const paramsNoPagination = [...params];

    const pagination = this.db.paginate(input, 100);
    const { offsetClause, limitClause } = this.db.paginationClauses(pagination, params);
    
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
    
    const text = textNoPagination + offsetClause + limitClause;
    const qryName = 'advert-text-search-' + hash(text);
    const { result, error } = await this.db.query<at.AdvertSummary>(text, params, qryName);
    if (error) throw new ErrNotFound();
    data = result && result.rows ? result.rows : [];

    const meta = await this.db.queryMeta(textNoPagination, paramsNoPagination, 'meta-' + qryName);

    if (with_assets && data.length) {
      // with side effect on data
      await this.assetService._find_attach_assets({ user, data, parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.ADVERT });
    }

    return { data, meta };
  }

  async advert_search_by_user({ user, input }: at.AdvertSearchInput): Promise<at.AdvertSearchOutput> {
    // keeping this function for convenience
    // search by user_id/username included in advert_search()
    return this.advert_search({ user, input });
  }

  _api() {
    return {
      advert_create: this,
      advert_delete: this,
      advert_retrieve: this,
      advert_retrieve_by_username_and_slug: this,
      advert_search: this,
      advert_search_by_user: this,
      advert_update: this,
    };
  }
}
