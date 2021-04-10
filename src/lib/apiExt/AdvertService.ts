import * as _ from '../constants';
import * as at from '../apiTypes';
import * as dm from '../dbModels';
import { IDb } from '../db';
import { ErrForbidden, ErrNotFound } from '../errors';
import { hash, log, makeAdvertSlug, makePostSlug, newRow, newUuid, updateRow } from '../utils';
import { AssetService } from './AssetService';
import { UserService } from './UserService';

export class AdvertService {

  constructor(
    private db: IDb,
    private assetService: AssetService,
    private userService: UserService,
  ) {

  }

  async advert_create({ user, input }: at.AdvertCreateInput): at.AdvertCreateOutput {
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
        await this.assetService.entity_asset_create({
          user,
          input: {
            parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.ADVERT,
            parent_entity_id: id,
            purpose: _.ENTITY_ASSET_PURPOSE.ADVERT_IMAGE,
            asset_id,
          },
        });
      } catch (err) {
        log('entityAssetInsertResult error', err);
      }
    }
    return { data: 0 < result.rowCount ? id : null, error };
  }

  async advert_retrieve({ user, id, input }: at.AdvertRetrieveInput): at.AdvertRetrieveOutput {
    // TODO: validate uuid
    // TODO: analytics of 'views' per record per visitor per day
    const { with_assets = false, with_owner = false } = input;
    const { row, error } = await this.db.find<dm.Advert>(_.TBL_ADVERT, { id }, 1);
    if (!row || error) throw new ErrNotFound(_.MSG_ADVERT_NOT_FOUND);
    if (with_assets) {
      // with side effect on data
      await this.assetService.find_attach_assets<dm.Advert>({ user, data: [ row ], parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.ADVERT });
    }
    if (with_owner) {
      const { data: owner } = await this.userService.user_retrieve({ id: row.user_id }); // will throw err
      row['owner'] = owner;
    }
    return { data: row, error };
  }

  async advert_update({ user, id, input }: at.AdvertUpdateInput): at.AdvertUpdateOutput {
    // TODO: validate inputs
    // eslint-disable-next-line prefer-const
    let { slug, title, content, tags, is_buying = 0, is_service = 0 } = input;
    // eslint-disable-next-line prefer-const
    let { price = 0, currency = 'GBP', lat = 0, lon = 0, geo_accuracy = 9999 } = input;
    const now = new Date();

    const { row: advertFound, error: findAdvertErr } = await this.db.find<dm.Advert>(_.TBL_ADVERT, { id }, 1);
    if (findAdvertErr) throw findAdvertErr;
    if (!advertFound) throw new ErrNotFound(_.MSG_ADVERT_NOT_FOUND);
    if (advertFound.user_id !== user.id) throw new ErrForbidden(); // TODO: we can use postFound.created_by

    if (!title) title = 'my advert at ' + now.toISOString();
    if (!slug) slug = title;
    slug = makeAdvertSlug(slug);
    const change = updateRow({
      user, slug, title, content, tags,
      is_buying, is_service, price, currency,
      lat, lon, geo_accuracy,
    });
    const { result, error: updateAdvertError } = await this.db.update(_.TBL_ADVERT, { id }, change, 1);
    if (!result || updateAdvertError) throw updateAdvertError;

    return { data: result && result.rowCount && result.rowCount > 0 };
  }

  async advert_delete({ id }: at.AdvertDeleteInput): at.AdvertDeleteOutput {
    // TODO: validate uuid
    // TODO: delete related records
    const { result, error } = await this.db.del(_.TBL_ADVERT, { id }, 1);
    return { data: 0 < result.rowCount, error };
  }

  async advert_search({ user, input }: at.AdvertSearchInput): at.AdvertSearchOutput {
    let data = [], ph = '';
    // eslint-disable-next-line prefer-const
    let { user_id = null, username = null, q = '', tag = '', min_price = '-1', max_price = '-1', offset = '0', limit = '10', with_assets = false } = input;
    const minPrice = Number.parseInt(`${min_price}`);
    const maxPrice = Number.parseInt(`${max_price}`);
    
    let myOffset = Number.parseInt(`${offset}`);
    if (myOffset < 0) myOffset = 0;
    let myLimit = Number.parseInt(`${limit}`);
    if (100 < myLimit) myLimit = 100;

    const conditions = [], params = [];
    if (user_id) {
      params.push(user_id);
      conditions.push('a.user_id = ' + this.db.placeHolder(params.length));
    }
    if (username) {
      params.push(username);
      conditions.push('u.username = ' + this.db.placeHolder(params.length));
    }
    if (q !== '') {
      params.push(`%${q}%`);
      ph = this.db.placeHolder(params.length); // TODO: use fulltext search
      conditions.push(`a.title LIKE ${ph} OR a.content LIKE ${ph}`);
    }
    if (tag !== '') {
      params.push(`%${tag}%`); // TODO: use tag index
      conditions.push('a.tags LIKE ' + this.db.placeHolder(params.length));
    }
    if (0 <= minPrice) {
      params.push(min_price);
      conditions.push(this.db.placeHolder(params.length) + ' <= a.price');
    }
    if (0 <= maxPrice) {
      params.push(max_price);
      conditions.push('a.price <= ' + this.db.placeHolder(params.length));
    }
    const whereStr = conditions.length ? ` WHERE (${conditions.join(') AND (')})` : '';
    
    const paramsNoPagination = [...params];

    params.push(myOffset);
    const offsetStr = ' OFFSET ' + this.db.placeHolder(params.length);
    params.push(myLimit);
    const limitStr = ' LIMIT ' + this.db.placeHolder(params.length);
    
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
    const { result, error: findError } = await this.db.query(text, params, qryName);
    if (findError) throw findError;
    data = result && result.rows ? result.rows : [];

    const meta = await this.db.queryMeta(textNoPagination, paramsNoPagination, 'meta-' + qryName);

    if (with_assets && data.length) {
      // with side effect on data
      await this.assetService.find_attach_assets({ user, data, parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.ADVERT });
    }

    return { data, meta };
  }

  async advert_search_by_user({ user, input }: at.AdvertSearchInput): at.AdvertSearchOutput {
    // keeping this function for convenience
    // search by user_id/username included in advert_search()
    return this.advert_search({ user, input });
  }

  // use retrieve_advert(), it is faster
  async advert_retrieve_by_username_and_slug({ user, input }: at.AdvertRetrieveInput): at.AdvertRetrieveOutput {
    let data = null;
    // eslint-disable-next-line prefer-const
    let { username = '', slug = '', with_assets = false } = input;
    username = username.toLowerCase();
    slug = slug.toLowerCase();
    const { row: advertOwner, error: userError } = await this.db.find<dm.UserPublic>(_.TBL_USER, { username }, 1);
    if (userError) throw userError;
    if (!advertOwner) throw new ErrNotFound('user not found');

    const text = 'SELECT * FROM ' + _.TBL_ADVERT
      + ' WHERE (user_id = $1) AND (slug = $2)';
    const { result, error: advertError } = await this.db.query(text, [advertOwner.id, slug], 'advert-by-user-and-ref');
    if (!result || advertError) throw advertError;
    if (result && result.rows && result.rows[0]) {
      // TODO: analytics of 'views' per record per visitor per day
      data = result.rows[0];
    } else {
      throw new ErrNotFound('advert not found');
    }

    if (with_assets && data) {
      // with side effect on data
      await this.assetService.find_attach_assets({ user, data: [ data ], parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.ADVERT });
    }

    return { data };
  }

  _api() {
    return {
      advert_create: this.advert_create,
      advert_delete: this.advert_delete,
      advert_retrieve: this.advert_retrieve,
      advert_retrieve_by_username_and_slug: this.advert_retrieve_by_username_and_slug,
      advert_search: this.advert_search,
      advert_search_by_user: this.advert_search_by_user,
      advert_update: this.advert_update,
    };
  }
}
