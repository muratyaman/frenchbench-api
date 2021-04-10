import { AdvertDetails, AdvertSummary, Asset, AssetRelation, EntityKindEnum, PostDetails, PostSummary, UserPublic, UserSummary } from './lib';

export type UserMapper = UserPublic;
export type UserSummaryMapper = UserSummary;
export interface UserListMapper {
  data: UserSummaryMapper[];
  meta: ListMetaMapper;
}

export type AdvertMapper = AdvertDetails;
export type AdvertSummaryMapper = AdvertSummary;
export interface AdvertListMapper {
  data: AdvertSummaryMapper[];
  meta: ListMetaMapper;
}

export type PostMapper = PostDetails;
export type PostSummaryMapper = PostSummary;
export interface PostListMapper {
  data: PostSummaryMapper[];
  meta: ListMetaMapper;
}

export type AssetMapper = Asset;
export interface AssetListMapper {
  data: AssetMapper[];
  meta: ListMetaMapper;
}

export type AssetRelationMapper = AssetRelation;

export interface AssetRelationListMapper {
  parent_entity_kind: EntityKindEnum;
  parent_entity_id: string;
  data: AssetRelation[];
  meta: ListMetaMapper;
}

export interface ListMetaMapper {
  row_count: number;
  error?: string | null;
}
