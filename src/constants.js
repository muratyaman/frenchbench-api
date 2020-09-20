// table names in the database
export const TBL_USER         = 'users';
export const TBL_ASSET        = 'assets';
export const TBL_ENTITY_ASSET = 'entities_assets';
export const TBL_LOOKUP       = 'lookups';
export const TBL_POST         = 'posts';

export const tablesFields = {
  [TBL_USER]:         ['id', 'username', 'password_hash', 'first_name', 'last_name', 'email', 'headline', 'neighbourhood', 'lat', 'lon', 'raw_geo', 'created_at', 'updated_at'],
  [TBL_ASSET]:        ['id', 'asset_type', 'media_type', 'label', 'url', 'meta', 'created_at', 'updated_at', 'created_by', 'updated_by'],
  [TBL_ENTITY_ASSET]: ['id', 'parent_entity_kind', 'parent_entity_id', 'asset_id', 'purpose', 'meta', 'created_at', 'updated_at', 'created_by', 'updated_by'],
  [TBL_LOOKUP]:       ['id', 'category', 'value', 'label', 'meta', 'created_at', 'updated_at', 'created_by', 'updated_by'],
  [TBL_POST]:         ['id', 'user_id', 'post_ref', 'title', 'content', 'tags', 'created_at', 'updated_at', 'created_by', 'updated_by'],
};

// standard http routes
export const RUT_ASSETS             = '/assets'; // file upload/download is needed
export const RUT_ASSET_BY_ID        = '/assets/:id'; // file upload/download is needed
export const RUT_ENTITIES_ASSETS    = '/entities-assets';
export const RUT_ENTITY_ASSET_BY_ID = '/entities-assets/:id';
export const RUT_LOOKUPS            = '/lookups';
export const RUT_LOOKUP_BY_ID       = '/lookups/:id';
export const RUT_USERS              = '/users';
export const RUT_USER_BY_ID         = '/users/:id';
export const RUT_POSTS              = '/posts';
export const RUT_POST_BY_ID         = '/posts/:id';

// special http routes
export const RUT_AUTH                     = '/auth';
export const RUT_AUTH_LOGIN               = '/auth/login';
export const RUT_AUTH_LOGOUT              = '/auth/logout';
export const RUT_AUTH_PROVIDER_ME         = '/auth/me';
export const RUT_AUTH_PROVIDER_REGISTER   = '/auth/register';

export const RUT_ENTITY_BY_ID             = '/entity/:entityId';
export const RUT_ENTITY_BY_ID_ASSETS      = '/entity/:entityId/assets';
export const RUT_ENTITY_BY_ID_ASSET_BY_ID = '/entity/:entityId/assets/:assetId';

export const ERRORS = {
  PASSWORDS_NOT_SAME: 'passwords are not same',
  REGISTRATION_FAILED: 'registration failed',
  INVALID_CREDENTIALS: 'invalid credentials',
  RECORD_NOT_FOUND: 'record not found',
  RECORD_NOT_CREATED: 'failed to create record',
  RECORD_NOT_UPDATED: 'failed to update record',
  RECORD_NOT_DELETED: 'failed to delete record',
  DB_TRANS_START_ERR: 'failed to start db transaction',
  DB_TRANS_COMMIT_ERR: 'failed to commit db transaction',
  DB_TRANS_ROLLBACK_ERR: 'failed to rollback db transaction',
};
