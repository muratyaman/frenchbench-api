import * as ct from './commonTypes';

export interface HasAsset {
  asset: Asset;
}

export interface HasAssets {
  assets?: AssetRelation[];
}
export interface UserLinks {
  link_website: string | null;
  link_facebook: string | null;
  link_instagram: string | null;
  link_twitter: string | null;
  link_linkedin: string | null;
  link_youtube: string | null;
}
export type User = {
  id: string;
  username: string;
  password: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  email: string | null;
  email_verified: number;
  phone_mobile: string | null;
  phone_mobile_verified: number;
  headline: string | null;
  neighbourhood: string | null;
  is_volunteer: number;
} & UserLinks & ct.GeoLocation & ct.AuditFull;

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
  Key: string; // uploads/images/large/[uuid].jpg
  key: string; // uploads/images/large/[uuid].jpg
  ETag: string; // ec6f93cbfc059c411be1a73e17df583f
  Bucket: string; // frenchbench
  Location: string; // https://[bucket].s3.eu-west-2.amazonaws.com/uploads/images/large/[uuid].jpg
  file_size: number; // 336007
}

export type Asset = ct.AuditFull & {
  id: string;
  asset_type: AssetTypeEnum;
  media_type: string; // image/jpeg
  label: string; // image uploaded 2021-02-07T20:39:09.437Z
  url: string; // [uuid].jpg
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

export type BaseContent = ct.GeoLocation & ct.AuditCreated & ct.BasicContent;

export type Article = BaseContent;

export type Post = BaseContent;

export type Advert = BaseContent & {
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
