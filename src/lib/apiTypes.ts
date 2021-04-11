import * as ct from './commonTypes';
import * as dm from './dbModels';

export interface PageArgs {
  offset?: string | number | null;
  limit?: string | number | null;
}

export interface GeoFilter {
  lat1?: string | number | null;
  lon1?: string | number | null;
  lat2?: string | number | null;
  lon2?: string | number | null;
}

export interface TextSearchArgs {
  q?: string | null;
  tag?: string | null;
}

export interface UsernameSlugFilter {
  username?: string | null;
  slug?: string | null;
}

export interface UserFilter {
  user_id?: string | null;
  username?: string | null;
}

export interface AssetsFlag {
  with_assets?: boolean | null;
}

export interface OwnerFlag {
  with_owner?: boolean | null;
}

export interface HasOwner {
  owner?: dm.UserPublic;
}

export interface HasIds {
  ids?: string[];
}

export interface HasFields {
  fields?: string[];
}

export interface HasAssetId {
  asset_id?: string;
}

export interface HasAssetIds {
  asset_ids?: string[];
}

export type BasicFilter = PageArgs & TextSearchArgs & UserFilter & AssetsFlag & OwnerFlag;

export type Summarize<T> = Omit<T, 'content' | 'created_by' | 'updated_by'> & dm.HasAssets & ct.HasUsername;

export type CreateInput<T> = Omit<T, 'id' | 'created_at' | 'created_by' | 'updated_at' | 'updated_by'>;
export type UpdateInput<T> = Omit<T, 'id' | 'created_at' | 'created_by' | 'updated_at' | 'updated_by'>;

export interface ApiInput<TInput = any> {
  user?: ct.SessionUser;
  id?: string | null;
  input?: TInput;
}

export interface MetaBase {
  row_count: number;
}

export interface ApiResult<TData = any, TMeta = any> {
  data: TData;
  meta?: TMeta;
  error?: string | null;
}

export interface ApiResultList<TRow = any, TMeta = MetaBase> {
  data: Array<TRow>;
  meta: TMeta;
  error?: string | null;
}

export type IdCreated = string | null;

export type SignUpInput = ApiInput<{
  username?: string;
  password?: string;
  password_confirm?: string;
}>

export type SignUpOutput = Promise<ApiResult<SignInOutputData>>;

export interface SignInOutputData {
  id: string;
  username: string;
  token: string;
  token_type: 'Bearer';
}

export type SignInInput = ApiInput<{
  username?: string;
  password?: string;
}>;
export type SignInOutput = Promise<ApiResult<SignInOutputData>>;

export interface SignOutData {
  token: string;
}
export type SignOutOutput = Promise<ApiResult<SignOutData>>;

export type UserRetrieveInput  = ApiInput<{ id?: string; username?: string; } & HasFields>;
export type UserRetrieveOutput = Promise<ApiResult<dm.UserPublic>>;

export type UserSummary = Pick<dm.UserPublic, 'id' | 'username' | 'email_verified' | 'phone_verified' | 'lat' | 'lon' | 'geo_accuracy' | 'created_at'>;

export type UserSearchInput = ApiInput<PageArgs & GeoFilter & AssetsFlag & HasFields>;
export type UserSearchOutput = Promise<ApiResultList<UserSummary>>;

// POSTS * * *
export type PostSummary = Summarize<dm.Post>;
export type PostDetails = dm.Post & dm.HasAssets & HasOwner;

export type PostSearchInput  = ApiInput<BasicFilter & GeoFilter & HasFields & HasIds>;
export type PostSearchOutput = Promise<ApiResultList<PostSummary>>;

export type PostCreateInput = ApiInput<ct.BasicContentInput & ct.GeoLocation & HasAssetId>;
export type PostCreateOutput = Promise<ApiResult<IdCreated>>;

export type PostRetrieveInput  = ApiInput<UsernameSlugFilter & AssetsFlag & OwnerFlag & HasFields>;
export type PostRetrieveOutput = Promise<ApiResult<PostDetails>>;

export type PostUpdateInput = ApiInput<ct.BasicContentInput & ct.GeoLocation & HasAssetId>;
export type PostUpdateOutput = Promise<ApiResult<boolean>>;

export type PostDeleteInput  = ApiInput;
export type PostDeleteOutput = Promise<ApiResult<boolean>>;


// ADVERTS * * *
export type AdvertSummary = Summarize<dm.Advert>;
export type AdvertDetails = dm.Advert & dm.HasAssets & HasOwner;

export type AdvertSearchInput = ApiInput<BasicFilter & GeoFilter & HasIds & HasFields & {
  min_price?: string | number | null;
  max_price?: string | number | null;
}>;
export type AdvertSearchOutput = Promise<ApiResultList<AdvertSummary>>;

export type AdvertInput = ct.BasicContentInput & ct.GeoLocation & {
  asset_id?: string | null;
  is_buying: number;
  is_service: number;
  price: number;
  currency: string;
}
export type AdvertCreateInput  = ApiInput<AdvertInput>;
export type AdvertCreateOutput = Promise<ApiResult<IdCreated>>;

export type AdvertRetrieveInput  = ApiInput<UsernameSlugFilter & AssetsFlag & OwnerFlag & HasFields>;
export type AdvertRetrieveOutput = Promise<ApiResult<AdvertDetails>>;

export type AdvertUpdateInput  = ApiInput<AdvertInput>;
export type AdvertUpdateOutput = Promise<ApiResult<boolean>>;

export type AdvertDeleteInput  = ApiInput;
export type AdvertDeleteOutput = Promise<ApiResult<boolean>>;


// ASSETS * * *
export type EntityAssetSearchInput = ApiInput<PageArgs & {
  parent_entity_kind?: string | null;
  parent_entity_ids?: string[];
}>;
export type EntityAssetSearchOutput = Promise<ApiResult<Array<dm.EntityAsset & dm.HasAsset>>>;

export type EntityAssetCreateInput = ApiInput<{
  parent_entity_kind: string;
  parent_entity_id: string;
  purpose: string;
  asset_id: string,
  meta?: any;
}>;
export type EntityAssetCreateOutput = Promise<ApiResult<IdCreated>>;

export type EntityAssetRetrieveInput  = ApiInput;
export type EntityAssetRetrieveOutput = Promise<ApiResult<dm.EntityAsset>>;

export type EntityAssetDeleteInput  = ApiInput;
export type EntityAssetDeleteOutput = Promise<ApiResult<boolean>>;

//----
export type AssetCreateInput = ApiInput<CreateInput<dm.Asset>>;
export type AssetCreateOutput = Promise<ApiResult<IdCreated>>;

export type AssetSearchInput  = ApiInput<PageArgs & HasIds & HasFields>;
export type AssetSearchOutput = Promise<ApiResultList<dm.Asset>>;

export type AssetRetrieveInput  = ApiInput<HasFields>;
export type AssetRetrieveOutput = Promise<ApiResult<dm.Asset>>;

export type AssetDeleteInput  = ApiInput;
export type AssetDeleteOutput = Promise<ApiResult<boolean>>;

// ARTICLES * * *
export type ArticleSummary = Omit<dm.Article, 'content'> & dm.HasAssets;
export type ArticleDetails = dm.Article & dm.HasAssets;

export type ArticleSearchInput  = ApiInput<BasicFilter & HasFields>;
export type ArticleSearchOutput = Promise<ApiResultList<ArticleSummary>>;

export type ArticleCreateInput = ApiInput<ct.BasicContentInput & ct.GeoLocation & HasAssetId>;
export type ArticleCreateOutput = Promise<ApiResult<IdCreated>>;

export type ArticleRetrieveInput  = ApiInput<UsernameSlugFilter & AssetsFlag & HasFields>;
export type ArticleRetrieveOutput = Promise<ApiResult<ArticleDetails>>;

export type ArticleUpdateInput = ApiInput<ct.BasicContentInput & ct.GeoLocation & HasAssetId>;
export type ArticleUpdateOutput = Promise<ApiResult<boolean>>;

export type ArticleDeleteInput  = ApiInput;
export type ArticleDeleteOutput = Promise<ApiResult<boolean>>;
