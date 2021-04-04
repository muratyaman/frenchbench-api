import { EntityKindEnum, IAdvertDetailsModel, IAdvertSummaryModel, IAssetModel, IAssetRelation, IPostDetailsModel, IUser } from './lib';

export type UserMapper = IUser;
export interface UserListMapper {
  data: UserMapper[];
  meta: ListMeta;
}

export type AdvertMapper = IAdvertDetailsModel;
export type AdvertSummaryMapper = IAdvertSummaryModel;
export interface AdvertListMapper {
  data: AdvertSummaryMapper[];
  meta: ListMeta;
}

export type PostMapper = IPostDetailsModel;
export interface PostListMapper {
  data: PostMapper[];
  meta: ListMeta;
}

export type AssetMapper = IAssetModel;
export interface AssetListMapper {
  data: AssetMapper[];
  meta: ListMeta;
}

export type AssetRelationMapper = IAssetRelation;

export interface AssetRelationListMapper {
  parent_entity_kind: EntityKindEnum;
  parent_entity_id: string;
  data: IAssetRelation[];
  meta: ListMeta;
}

export interface ListMeta {
  row_count: number;
}
