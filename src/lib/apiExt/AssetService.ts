import * as _ from '../constants';
import * as at from '../apiTypes';
import * as ct from '../commonTypes';
import * as dm from '../dbModels';
import { DbService } from '../DbService';
import { ErrForbidden, ErrNotFound } from '../errors';
import { hash, newRow, newUuid } from '../utils';

export class AssetService {
  constructor(private db: DbService) {}

  async asset_create({ user, input }) {
    if (!user) throw new ErrForbidden();

    // TODO: validate input
    // eslint-disable-next-line prefer-const
    let { id = newUuid(), asset_type = null, media_type = null, label = null, url = null, meta = {} } = input;
    const row = newRow({ id, user, asset_type, media_type, label, url, meta });
    const { result, error } = await this.db.insert(_.TBL_ASSET, row);
    return { data: result.success ? id : null, error };
  }

  async asset_search({ input }: at.AssetSearchInput): at.AssetSearchOutput {
    let data: dm.Asset[] = [];
    const { ids = [] } = input;
    const conditions = [];
    const params = [];

    if (ids.length) {
      const idList = ids.map(id => {
        params.push(id); // side-effect
        return this.db.ph(params.length);
      });
      conditions.push('a.id IN (' + idList.join(',') + ')');
    }

    const paramsNoPagination = [...params];

    const whereStr = conditions.length ? ' WHERE (' + conditions.join(') AND (') + ')' : '';
    
    const textNoPagination = `
SELECT a.* FROM ${_.TBL_ASSET} a
${whereStr}
ORDER BY a.created_at DESC
`; // TODO: ranking, relevance

    const pagination = this.db.paginate(input, 100);
    const { offsetClause, limitClause } = this.db.paginationClauses(pagination, params);

    const text = textNoPagination + offsetClause + limitClause;
    const qryName = 'asset-search-' + hash(text);
    const { result, error: findError } = await this.db.query<dm.Asset>(text, params, qryName);
    if (findError) throw findError;
    data = result && result.rows ? result.rows : [];

    const meta = await this.db.queryMeta(textNoPagination, paramsNoPagination, 'meta-' + qryName);

    return { data, meta };
  }

  async asset_retrieve({ id }: at.AssetRetrieveInput): at.AssetRetrieveOutput {
    // TODO: validate uuid
    // TODO: analytics of 'views' per record per visitor per day
    const { row, error } = await this.db.find<dm.Asset>(_.TBL_ASSET, { id }, 1);
    if (!row || error ) throw new ErrNotFound();
    return { data: row };
  }

  async asset_delete({ user, id }: at.AssetDeleteInput): at.AssetDeleteOutput {
    // TODO: validate uuid
    // TODO: delete related records
    const { data: found } = await this.asset_retrieve({ user, id });
    if (user.id !== found.created_by) throw new ErrForbidden();
    const { result, error } = await this.db.del(_.TBL_ASSET, { id }, 1);
    // TODO: delete from file storage
    return { data: result.success, error };
  }

  async entity_asset_create({ user, input }: at.EntityAssetCreateInput): at.EntityAssetCreateOutput {
    if (!user) throw new ErrForbidden();

    // TODO: validate input
    // eslint-disable-next-line prefer-const
    let { parent_entity_kind, parent_entity_id, purpose, asset_id, meta = {} } = input;
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
    const { result, error } = await this.db.insert(_.TBL_ENTITY_ASSET, row);
    return { data: 0 < result.rowCount ? id : null, error };
  }

  async entity_asset_search({ user, input }: at.EntityAssetSearchInput): at.EntityAssetSearchOutput {
    let data = [];
    const { parent_entity_kind = null, parent_entity_ids = [], offset = '0', limit = '0' } = input;

    let myOffset = Number.parseInt(`${offset}`);
    if (myOffset < 0) myOffset = 0;
    let myLimit = Number.parseInt(`${limit}`);
    const maxLimit = 10 * parent_entity_ids.length;
    if (myLimit <= 0 || maxLimit < myLimit) myLimit = maxLimit; // TODO: get 10 asset each?!

    const conditions = [];
    const params = [];

    if (parent_entity_kind) {
      params.push(parent_entity_kind);
      conditions.push('parent_entity_kind = ' + this.db.ph(params.length));
    }

    if (parent_entity_ids.length) {
      conditions.push('parent_entity_id IN (' + parent_entity_ids.map(peid => {
        params.push(peid);
        return this.db.ph(params.length);
      }) + ')');
    }

    params.push(offset);
    const offsetStr = ' OFFSET ' + this.db.ph(params.length);
    params.push(limit);
    const limitStr = ' LIMIT ' + this.db.ph(params.length);

    const whereStr = conditions.length ? ' WHERE (' + conditions.join(') AND (') + ')' : '';
    const text = 'SELECT ea.*, row_to_json(a.*) AS asset '
      + ' FROM '+ _.TBL_ENTITY_ASSET + ' ea'
      + ' INNER JOIN ' + _.TBL_ASSET + ' a ON ea.asset_id = a.id '
      + whereStr
      + ' ORDER BY ea.created_at DESC' // TODO: ranking, relevance
      + offsetStr
      + limitStr;
    const preparedQryName = 'entity-asset-search-' + hash(text);
    const { result, error: findError } = await this.db.query(text, params, preparedQryName);
    if (findError) throw findError;
    data = result && result.rows ? result.rows : [];
    return { data };
  }

  async entity_asset_retrieve({ user, id }: at.EntityAssetRetrieveInput): at.EntityAssetRetrieveOutput {
    // TODO: validate uuid
    // TODO: analytics of 'views' per record per visitor per day
    const { row, error } = await this.db.find<dm.EntityAsset>(_.TBL_ENTITY_ASSET, { id }, 1);
    if (!row || error ) throw new ErrNotFound();
    return { data: row };
  }

  async entity_asset_delete({ user, id }: at.EntityAssetDeleteInput): at.EntityAssetDeleteOutput {
    // TODO: validate uuid
    // TODO: delete related records
    const { data: found } = await this.entity_asset_retrieve({ user, id });
    if (user.id !== found.created_by) throw new ErrForbidden();
    const { result, error } = await this.db.del(_.TBL_ENTITY_ASSET, { id }, 1);
    return { data: result.success, error };
  }

  // This has side effects on data!
  async _find_attach_assets<TRow extends ct.HasId>(
    { user, data, parent_entity_kind = null }: { user: ct.SessionUser, data: Array<TRow>, parent_entity_kind?: string | null }
  ): Promise<Array<TRow & dm.HasAssets>> {
    const { data: entityAssets } = await this.entity_asset_search({
      user,
      input: {
        parent_entity_kind,
        parent_entity_ids: data.map(r => r.id),
        offset: 0,
        limit: 10 * data.length,
      },
    });
    if (entityAssets) {
      entityAssets.forEach(eaRow => {
        const { parent_entity_id } = eaRow;
        const parentEntity = data.find(row => row.id === parent_entity_id);
        if (parentEntity) {
          if (!('assets' in parentEntity)) parentEntity['assets'] = []; // init assets array
          parentEntity['assets'].push(eaRow);
        }
      });
    }
    return data;
  }

  _entity_asset_create_post_image(user: ct.SessionUser,  post_id: string, asset_id: string) {
    return this.entity_asset_create({
      user,
      input: {
        parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.POST,
        parent_entity_id: post_id,
        purpose: _.ENTITY_ASSET_PURPOSE.POST_IMAGE,
        asset_id,
      },
    });
  }

  _entity_asset_create_advert_image(user: ct.SessionUser,  advert_id: string, asset_id: string) {
    return this.entity_asset_create({
      user,
      input: {
        parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.ADVERT,
        parent_entity_id: advert_id,
        purpose: _.ENTITY_ASSET_PURPOSE.ADVERT_IMAGE,
        asset_id,
      },
    });
  }

  _api() {
    return {
      asset_create: this,
      asset_delete: this,
      asset_retrieve: this,
      asset_search: this,
      entity_asset_create: this,
      entity_asset_delete: this,
      entity_asset_retrieve: this,
      entity_asset_search: this,
    };
  }
}
