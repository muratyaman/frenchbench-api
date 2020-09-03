// table names in the database
// protected
export const TBL_AUTH_CONSENT  = 'auth_consents';
export const TBL_AUTH_IDENTITY = 'auth_identities';
export const TBL_SECRET        = 'secrets';
export const TBL_USER          = 'users';

// public
export const TBL_ASSET            = 'assets';
export const TBL_ENTITY_ASSET     = 'entities_assets';
export const TBL_LOOKUP           = 'lookups';
export const TBL_USER_ACHIEVEMENT = 'users_achievements';
export const TBL_USER_EMAIL       = 'users_emails';
export const TBL_USER_LANGUAGE    = 'users_languages';
export const TBL_USER_POST        = 'users_posts';
export const TBL_USER_PROFILE     = 'users_profiles';
export const TBL_USER_PROJECT     = 'users_projects';
export const TBL_USER_SKILL       = 'users_skills';

export const tablesFields = {
  [TBL_ASSET]:            ['id', 'asset_type', 'media_type', 'label', 'url', 'meta', 'created_at', 'updated_at', 'created_by', 'updated_by'],
  [TBL_AUTH_CONSENT]:     ['id', 'provider_id', 'scope', 'auth_code', 'grant_type', 'access_token', 'refresh_token', 'expires_at', 'created_at', 'updated_at'],
  [TBL_AUTH_IDENTITY]:    ['id', 'provider_id', 'external_username', 'meta', 'created_by', 'updated_by'],
  [TBL_ENTITY_ASSET]:     ['id', 'parent_entity_kind', 'parent_entity_id', 'asset_id', 'meta', 'created_at', 'updated_at', 'created_by', 'updated_by'],
  [TBL_LOOKUP]:           ['id', 'category', 'value', 'label', 'meta', 'created_at', 'updated_at', 'created_by', 'updated_by'],
  [TBL_SECRET]:           ['id', 'secret', 'email', 'meta', 'created_at'],
  [TBL_USER]:             ['id', 'username', 'password_hash', 'created_at', 'updated_at', 'created_by', 'updated_by'],
  [TBL_USER_ACHIEVEMENT]: ['id', 'user_id', 'achievement', 'organisation', 'date_from', 'date_to', 'info', 'order_idx', 'created_at', 'updated_at', 'created_by', 'updated_by'],
  [TBL_USER_EMAIL]:       ['id', 'user_id', 'email', 'created_at', 'updated_at', 'created_by', 'updated_by'],
  [TBL_USER_LANGUAGE]:    ['id', 'user_id', 'language', 'stars', 'order_idx', 'created_at', 'updated_at', 'created_by', 'updated_by'],
  [TBL_USER_POST]:        ['id', 'user_id', 'post_ref', 'title', 'summary', 'tags', 'content', 'created_at', 'updated_at', 'created_by', 'updated_by'],
  [TBL_USER_PROFILE]:     ['id', 'user_id', 'first_name', 'middle_name', 'last_name', 'job_title', 'organisation', 'industry', 'city', 'country', 'dob_year', 'min_salary', 'summary', 'created_at', 'updated_at', 'created_by', 'updated_by'],
  [TBL_USER_PROJECT]:     ['id', 'user_id', 'summary', 'organisation', 'date_from', 'date_to', 'info', 'skills', 'order_idx', 'created_at', 'updated_at', 'created_by', 'updated_by'],
  [TBL_USER_SKILL]:       ['id', 'user_id', 'skill', 'stars', 'order_idx', 'created_at', 'updated_at', 'created_by', 'updated_by'],
};

// standard http routes
export const RUT_ASSET        = '/asset'; // file upload/download is needed
export const RUT_ENTITY_ASSET = '/entity-asset';
export const RUT_LOOKUP       = '/lookup';
export const RUT_USER         = '/user';

// child routes
export const RUT_USERS_ACHIEVEMENT = '/user/:userId/achievement';
export const RUT_USERS_LANGUAGE    = '/user/:userId/language';
export const RUT_USERS_POST        = '/user/:userId/post';
export const RUT_USERS_PROFILE     = '/user/:userId/profile';
export const RUT_USERS_PROJECT     = '/user/:userId/project';
export const RUT_USERS_SKILL       = '/user/:userId/skill';

// special http routes
export const RUT_AUTH                       = '/auth';
export const RUT_AUTH_LOGIN                 = '/auth/login';
export const RUT_AUTH_LOGOUT                = '/auth/logout';
export const RUT_AUTH_PROVIDER_AUTHENTICATE = '/auth/:provider/authenticate';
export const RUT_AUTH_PROVIDER_ME           = '/auth/:provider/me';
export const RUT_AUTH_PROVIDER_REGISTER     = '/auth/:provider/register';
export const RUT_AUTH_PROVIDER_AUTHORIZE    = '/auth/:provider/authorize';
export const RUT_ENTITIES_KIND_ID           = '/entity/:kind/:id';
export const RUT_ENTITIES_KIND_ID_ASSET     = '/entity/:kind/:id/asset';

export const ERRORS = {
  PASSWORDS_NOT_SAME: 'passwords are not same',
  EMAIL_VERIFICATION: 'email verification failed',
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
