import * as ct from './commonTypes';

export interface HasAsset {
  asset: Asset;
}

export interface HasAssets {
  assets?: AssetRelation[];
}

export type User = ct.GeoLocation & ct.AuditFull & {
  id: string;
  username: string;
  password: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  email: string | null;
  email_verified: number;
  phone: string | null;
  phone_verified: number;
  headline: string | null;
  neighbourhood: string | null;
};

export type UserPublic = Omit<User, 'password' & 'password_hash'>;

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

export interface AssetMeta {
  Key: string; // uploads/images/large/030e8ef3-17a2-4dbf-a8ae-41872f04fa35.jpg
  key: string; // uploads/images/large/030e8ef3-17a2-4dbf-a8ae-41872f04fa35.jpg
  ETag: string; // ec6f93cbfc059c411be1a73e17df583f
  Bucket: string; // frenchbench
  Location: string; // https://frenchbench.s3.eu-west-2.amazonaws.com/uploads/images/large/030e8ef3-17a2-4dbf-a8ae-41872f04fa35.jpg
  file_size: number; // 336007
}

export type Asset = ct.AuditFull & {
  id: string;
  asset_type: AssetTypeEnum;
  media_type: string; // image/jpeg
  label: string; // image uploaded 2021-02-07T20:39:09.437Z
  url: string; // 030e8ef3-17a2-4dbf-a8ae-41872f04fa35.jpg
  meta: AssetMeta;
};

export type AssetRelation = ct.AuditFull & {
  id: string;
  parent_entity_kind: EntityKindEnum;
  parent_entity_id: string;
  purpose: AssetPurposeEnum;
  asset_id: string;
  meta: any;
  asset: Asset;
};
export type EntityAsset = AssetRelation; // alias

export type Article = ct.GeoLocation & ct.AuditCreated & ct.BasicContent;

export type Post = Article;

export type Advert = Article & {
  is_buying: number;
  is_service: number;
  price: number;
  currency: string;
};

export interface EmailVerification {
  id: string;
  email: string;
  code: string;
  created_at: Date;
  used: number; // used as boolean
    
  // unique [email, code]
}

export interface PhoneVerification {
  id: string;
  phone: string;
  code: string;
  created_at: Date;
  used: number; // used as boolean
    
  // unique [email, code]
}
