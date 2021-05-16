export interface AuditCreated {
  created_at: Date;
  created_by: string | null;
}

export interface AuditUpdated {
  updated_at: Date;
  updated_by: string | null;
}

//export type WithAuditCreated<T> = T & AuditCreated;
//export type WithAuditUpdated<T> = T & AuditUpdated;

export type AuditFull = AuditCreated & AuditUpdated;
//export type WithAuditFull<T> = T & AuditCreated & AuditUpdated;

export interface GeoLocation {
  lat: number | null;
  lon: number | null;
  geo_accuracy: number | null;
  geo_updated_at: Date | null;
}
//export type WithGeoLocation<T> = T & GeoLocation;

export interface BasicContent {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  content: string;
  tags: string;
}

export type BasicContentInput = Omit<BasicContent, 'id' | 'user_id'>;

export interface HasId {
  id: string;
}

export interface HasUsername {
  username: string;
}

export interface SessionUser {
  id?: string | null;
  username?: string | null;
}

export interface SessionUserAndError {
  user?: SessionUser | null;
  error?: string | null;
}
