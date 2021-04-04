export type INumStr = number | string;
export type INumStrNullable = number | string | null;

export interface ISessionUser {
  id?: string | null;
}

export interface ISessionUserAndError {
  user?: ISessionUser | null;
  error?: string | null;
}

export interface AuditCreated {
  created_at: Date;
  created_by: string | null;
}

export interface AuditUpdated {
  updated_at: Date;
  updated_by: string | null;
}

export type WithAuditCreated<T> = T & AuditCreated;
export type WithAuditUpdated<T> = T & AuditUpdated;
export type WithAuditFull<T> = T & AuditCreated & AuditUpdated;

export interface GeoLocation {
  lat: number | null;
  lon: number | null;
  geo_accuracy: number | null;
  geo_updated_at: Date | null;
}
export type WithGeoLocation<T> = T & GeoLocation;

export type IUser = WithGeoLocation<WithAuditFull<{
  id: string;
  username: string;
  password: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  headline: string | null;
  neighbourhood: string | null;
}>>;

export type IUserPublic = Omit<IUser, 'password' & 'password_hash'>;

export enum EntityKindEnum {
  ADVERTS = 'adverts',
  ARTICLES = 'articles',
  POSTS = 'posts',
  USERS = 'users',
}

export enum AssetPurposeEnum {
  ADVERT_IMAGE = 'advert-image',
  POST_IMAGE = 'post-image',
}

export enum AssetTypeEnum {
  IMAGE = 'image',
}

export enum AssetMediaTypeEnum {
  IMAGE_JPEG = 'image/jpeg',
  IMAGE_PNG = 'image/png',
}

export interface IAssetMetaModel {
  Key: string; // uploads/images/large/030e8ef3-17a2-4dbf-a8ae-41872f04fa35.jpg
  key: string; // uploads/images/large/030e8ef3-17a2-4dbf-a8ae-41872f04fa35.jpg
  ETag: string; // ec6f93cbfc059c411be1a73e17df583f
  Bucket: string; // frenchbench
  Location: string; // https://frenchbench.s3.eu-west-2.amazonaws.com/uploads/images/large/030e8ef3-17a2-4dbf-a8ae-41872f04fa35.jpg
  file_size: number; // 336007
}

export type IAssetModel = WithAuditFull<{
  id: string;
  asset_type: AssetTypeEnum;
  media_type: string; // image/jpeg
  label: string; // image uploaded 2021-02-07T20:39:09.437Z
  url: string; // 030e8ef3-17a2-4dbf-a8ae-41872f04fa35.jpg
  meta: IAssetMetaModel;
}>;

export type IAssetRelation = WithAuditFull<{
  id: string;
  parent_entity_kind: EntityKindEnum;
  parent_entity_id: string;
  purpose: AssetPurposeEnum;
  asset_id: string;
  meta: any;
  asset: IAssetModel;
}>;

export interface IAdvertSummaryModel {
  id: string;
  slug: string;
  title: string;
  tags: string;
  is_buying: number;
  is_service: number;
  price: number;
  currency: string; // GBP
  created_at: string;
  user_id: string;
  username: string;
  assets?: IAssetRelation[];
  lat?: number | null;
  lon?: number | null;
  geo_accuracy?: number;
}

export interface IAdvertDetailsModel extends IAdvertSummaryModel {
  content: string;
  created_by: string;
  updated_by: string;
  assets?: IAssetRelation[];
}

export type IPostSummaryModel = WithAuditCreated<{
  id: string;
  slug: string;
  title: string;
  tags: string;
  user_id: string;
  username: string;
  assets?: IAssetRelation[];
  lat?: number | null;
  lon?: number | null;
  geo_accuracy?: number;
}>;

export type IPostDetailsModel = WithAuditUpdated<WithGeoLocation<IPostSummaryModel>> & {
  content: string;
}


export interface IArticleSummaryModel {
  id: string;
  slug: string;
  title: string;
  keywords: string;
  created_at: string;
  updated_at: string;
  assets?: IAssetRelation[];
}

export interface IArticleDetailsModel extends IArticleSummaryModel {
  content: string;
  created_by: string;
  updated_by: string;
  assets?: IAssetRelation[];
}
