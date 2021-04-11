import jwtManager from 'jsonwebtoken';
import * as _ from '../constants';
import * as at from '../apiTypes';
import * as dm from '../dbModels';
import { DbService } from '../DbService';
import { IConfig } from '../config';
import { SecurityService } from '../SecurityService';
import { ErrBadRequest, ErrForbidden } from '../errors';
import { newRow, newUuid, updateRow } from '../utils';
import { AssetService } from './AssetService';

export class UserService {

  constructor(
    private config: IConfig,
    private db: DbService,
    private securityMgr: SecurityService,
    private assetService: AssetService,
  ) {}

  // TODO: captcha
  async signup({ input }: at.SignUpInput): at.SignUpOutput {
    let data = null, error = null;
    try {
      const { username = '', password = '', password_confirm = '' } = input;
      const usernamePruned = this.securityMgr.pruneUsername(username);
      if (usernamePruned !== username) throw new ErrBadRequest(_.MSG_INVALID_USERNAME);
      if (!(password !== '' && password === password_confirm)) throw new ErrBadRequest(_.MSG_INVALID_PASSWORD);
      if (!this.securityMgr.isStrongPassword(password)) throw new ErrBadRequest(_.MSG_INVALID_PASSWORD);

      const { row: found, error: lookupErr } = await this.db.find<dm.User>(_.TBL_USER, { username }, 1);
      if (found || lookupErr) throw new ErrBadRequest(_.MSG_NONUNIQUE_USERNAME);
      
      const password_hash = await this.securityMgr.hashPassword(password);
      if (!password_hash) throw new Error(_.MSG_UNKNOWN_ERROR); // unexpected
      
      const id = newUuid();
      const userRow = newRow({ username, password_hash, id, user: { id } });
      const { result, error: insertError } = await this.db.insert(_.TBL_USER, userRow);
      if (!result || insertError) throw new Error(_.MSG_UNKNOWN_ERROR);

      // auto-login
      if (result.success) {
        const signInOutput = await this.signin({ input: { username, password }});
        data = signInOutput.data;
        error = signInOutput.error;
      }
    } catch (err) {
      error = err.message;
    }
    return { data, error };
  }

  async signin({ input }: at.SignInInput): at.SignInOutput {
    let data = null, token = null, error = _.MSG_INVALID_CREDENTIALS;

    const { username = '', password = '' } = input;
    if (!(username !== '' && password !== '')) throw new ErrBadRequest(error);

    const found = await this.db.findOneOrErr<dm.User>(_.TBL_USER, { username }, error);

    const passwordOK = await this.securityMgr.verifyPassword(password, found.password_hash);
    if (!passwordOK) throw new ErrBadRequest(error);

    const { id } = found;
    const userData = { id, username }; // TODO: do not use username, it may be updated by user
    token = jwtManager.sign(userData, this.config.jwt.secret, { expiresIn: '1d', algorithm: 'HS256' });
    data = { id, username, token, token_type: 'Bearer' };
    error = null;

    return { data, error };
  }

  async signout(): at.SignOutOutput {
    return { data: { token: '' }, error: null }; // side-effect ==> invalid cookie on browser
  }

  // we can use user_retrieve
  async user_retrieve_self({ user }: at.UserRetrieveInput): at.UserRetrieveOutput {
    const { id = '' } = user ?? {};
    if (!id || id === '') throw new ErrBadRequest();
    const row = await this.db.findOneOrErr<dm.User>(_.TBL_USER, { id }, _.MSG_USER_NOT_FOUND);
    const data = this.securityMgr.hideSensitiveUserProps(row);
    return { data };
  }

  async me({ user }: at.UserRetrieveInput): at.UserRetrieveOutput {
    return this.user_retrieve_self({ user });
  }

  async user_retrieve({ id }: at.UserRetrieveInput): at.UserRetrieveOutput {
    let data = null;
    // TODO: analytics of 'views' per record per visitor per day
    if (!id || id === '') throw new ErrBadRequest(_.MSG_ID_REQUIRED);
    const row = await this.db.findOneOrErr<dm.User>(_.TBL_USER, { id }, _.MSG_USER_NOT_FOUND);
    data = this.securityMgr.hideSensitiveUserProps(row);
    return { data };
  }

  async user_retrieve_by_username({ input = { username: '' }}: at.UserRetrieveInput): at.UserRetrieveOutput {
    // TODO: analytics of 'views' per record per visitor per day
    const { username = '' } = input;
    if (!username || (username === '')) throw new ErrBadRequest(_.MSG_USERNAME_REQUIRED);
    const row = await this.db.findOneOrErr<dm.User>(_.TBL_USER, { username }, _.MSG_USER_NOT_FOUND);
    const data = this.securityMgr.hideSensitiveUserProps(row);
    return { data };
  }

  async usercontact_update({ user, id, input }) {
    // permission is checked by _isProtected()
    // let { first_name, last_name, email, phone, headline, neighbourhood } = input;
    const change = updateRow({ ...input, user }); // TODO: limit inputs?
    // for now, only user himself can update
    if (user.id !== id) throw new ErrForbidden();
    const { result, error } = await this.db.update(_.TBL_USER, { id }, change, 1);
    return { data: result.success, error };
  }

  async usercontact_update_self({ user, input }) {
    // permission is checked by _isProtected()
    // let { first_name, last_name, email, phone, headline, neighbourhood } = input;
    const change = updateRow({ ...input, user }); // TODO: limit inputs?
    // for now, only user himself can update
    const { result, error } = await this.db.update(_.TBL_USER, { id: user.id }, change, 1);
    return { data: result.success, error };
  }

  async usergeo_update({ user, id, input }) {
    // permission is checked by _isProtected()
    const { lat = 0, lon = 0, geo_accuracy = 9999 } = input;
    const now = new Date();
    const change = updateRow({ lat, lon, geo_accuracy, geo_updated_at: now, user });
    // TODO: for now, only user himself can update
    if (user.id !== id) throw new ErrForbidden();
    const { result, error } = await this.db.update(_.TBL_USER, { id }, change, 1);
    return { data: result.success, error };
  }

  async usergeo_update_self({ user, input }) {
    // permission is checked by _isProtected()
    const { lat = 0, lon = 0, geo_accuracy = 9999 } = input;
    const now = new Date();
    const change = updateRow({ lat, lon, geo_accuracy, geo_updated_at: now, user });
    // TODO: for now, only user himself can update
    const { result, error } = await this.db.update(_.TBL_USER, { id: user.id }, change, 1);
    return { data: result.success, error };
  }

  // TODO user_delete, close account

  async user_search({ user, input }: at.UserSearchInput): at.UserSearchOutput {
    let data = [];
    // eslint-disable-next-line prefer-const
    let { lat1 = 0, lon1 = 0, lat2 = 0, lon2 = 0, with_assets = false } = input;
    
    const { data: me } = await this.user_retrieve_self({ user });

    // TODO: restrict area that can be searched e.g. by geolocation of current user

    const { latDelta, lonDelta } = this.config.geo;
    lat1 = lat1 ? lat1 : me.lat - latDelta;
    lat2 = lat2 ? lat2 : me.lat + latDelta;
    lon1 = lon1 ? lon1 : me.lon - lonDelta;
    lon2 = lon2 ? lon2 : me.lon + lonDelta;

    const params = [];
    const ph1 = this.db.param(params, lat1);
    const ph2 = this.db.param(params, lat2);
    const ph3 = this.db.param(params, lon1);
    const ph4 = this.db.param(params, lon2);

    const sqlUsers = `
SELECT
  id, username, email_verified, phone_verified, lat, lon, geo_accuracy, created_at
FROM ${_.TBL_USER}
WHERE (lat BETWEEN ${ph1} AND ${ph2})
  AND (lon BETWEEN ${ph3} AND ${ph4})
`;

    const { result, error: user_search_err } = await this.db.query<at.UserSummary>(sqlUsers, params, 'users-in-area');

    if (!result || user_search_err) throw user_search_err;
    
    data = result.rows;

    if (with_assets && data.length) {
      // with side effect on data
      data = await this.assetService._find_attach_assets<at.UserSummary>({ user, data, parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.USER });
    }
    // TODO: pagination and meta query
    return { data, meta: { row_count: data.length } };
  }

  _api() {
    return {
      signup: this,
      signin: this,
      signout: this,
      user_retrieve: this,
      user_retrieve_by_username: this,
      user_retrieve_self: this,
      me: this, // ALIAS
      user_search: this,
      usercontact_update: this,
      usercontact_update_self: this,
      usergeo_update: this,
      usergeo_update_self: this,
    };
  }
}
