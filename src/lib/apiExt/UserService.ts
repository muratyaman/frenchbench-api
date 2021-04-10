import jwtManager from 'jsonwebtoken';
import * as _ from '../constants';
import * as at from '../apiTypes';
import * as dm from '../dbModels';
import { IDb } from '../db';
import { IConfig } from '../config';
import { SecurityService } from '../SecurityService';
import { ErrBadRequest, ErrNotFound } from '../errors';
import { newRow, newUuid, updateRow } from '../utils';
import { AssetService } from './AssetService';

export class UserService {

  constructor(
    private config: IConfig,
    private db: IDb,
    private securityMgr: SecurityService,
    private assetService: AssetService
  ) {

  }

  // TODO: captcha
  async signup({ input }: at.SignUpInput): at.SignUpOutput {
    let data = null, error = null;
    try {
      const { username = '', password = '', password_confirm = '' } = input;
      const usernamePruned = this.securityMgr.pruneUsername(username);
      if (usernamePruned !== username) {
        throw new ErrBadRequest(_.MSG_INVALID_USERNAME);
      }
      if (!(password && password !== '' && password === password_confirm)) {
        throw new ErrBadRequest(_.MSG_INVALID_PASSWORD);
      }
      if (!this.securityMgr.isStrongPassword(password)) {
        throw new ErrBadRequest(_.MSG_INVALID_PASSWORD);
      }

      const { row: userFound, error: userLookupError } = await this.db.find(_.TBL_USER, { username }, 1);
      if (userFound) throw new ErrBadRequest(_.MSG_NONUNIQUE_USERNAME);
      if (userLookupError) { // this is unexpected
        // throw new ErrBadRequest(_.MSG_NONUNIQUE_USERNAME);
        throw new Error(_.MSG_UNKNOWN_ERROR);
      }
      const password_hash = await this.securityMgr.hashPassword(password);
      if (!password_hash) { // this is unexpected
        throw new Error(_.MSG_UNKNOWN_ERROR);
      }
      const id = newUuid();
      const userRow = newRow({ username, password_hash, id, user: { id } });
      const { result, error: insertError } = await this.db.insert(_.TBL_USER, userRow);
      if (insertError) { // this is unexpected
        // throw insertError;
        throw new Error(_.MSG_UNKNOWN_ERROR);
      }

      // auto-login
      if (result && result.rowCount) {
        const signInOutput = await this.signin({ input: { username, password }});
        data = signInOutput.data;
        error = signInOutput.error;
      } else {
        // not good
      }
    } catch (err) {
      error = err.message;
    }
    return { data, error };
  }

  async signin({ input }: at.SignInInput): at.SignInOutput {
    let data = null, token = null, error = _.MSG_INVALID_CREDENTIALS;

    const { username = '', password = '' } = input;
    username.trim().toLowerCase();
    if (!(username && username !== '' && password && password !== '')) throw new Error(error);

    const { row: found, error: userLookupError } = await this.db.find<dm.User>(_.TBL_USER, { username }, 1);
    if (userLookupError) throw userLookupError;
    if (!found) throw new ErrNotFound(error);

    const passwordOK = await this.securityMgr.verifyPassword(password, found.password_hash);
    if (!passwordOK) throw new Error(error);

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
  async user_retrieve_self({ user = { id: '' }}: at.UserRetrieveInput): at.UserRetrieveOutput {
    const { id = '' } = user ?? {};
    if (id && (id !== '')) {
      const { row, error } = await this.db.find<dm.User>(_.TBL_USER, { id }, 1);
      const data = this.securityMgr.hideSensitiveUserProps(row);
      return { data, error };
    } else {
      return { data: null, error: 'user id is null' };
    }
  }

  async user_retrieve({ id = null }: at.UserRetrieveInput): at.UserRetrieveOutput {
    let data = null;
    // TODO: analytics of 'views' per record per visitor per day
    const condition = { id };
    if (!id) throw new ErrBadRequest(_.MSG_ID_REQUIRED);
    const { row, error } = await this.db.find<dm.User>(_.TBL_USER, condition, 1);
    if (error) throw error;
    data = this.securityMgr.hideSensitiveUserProps(row);
    return { data, error };
  }

  async user_retrieve_by_username({ input = { username: '' }}: at.UserRetrieveInput): at.UserRetrieveOutput {
    let data = null;
    // TODO: analytics of 'views' per record per visitor per day
    const { username = '' } = input;
    if (!username || (username === '')) throw new ErrBadRequest(_.MSG_USERNAME_REQUIRED);
    const condition = { username };
    const { row, error } = await this.db.find<dm.User>(_.TBL_USER, condition, 1);
    if (error) throw error;
    data = this.securityMgr.hideSensitiveUserProps(row);
    return { data, error };
  }

  async user_search({ user, input }: at.UserSearchInput): at.UserSearchOutput {
    let data = [];
    // eslint-disable-next-line prefer-const
    let { lat1 = 0, lon1 = 0, lat2 = 0, lon2 = 0, with_assets = false } = input;
    
    // load details of current user
    const { row: me, error: userErr } = await this.db.find<dm.User>(_.TBL_USER, { id: user.id ?? null }, 1);
    if (!me || userErr) throw new ErrNotFound('current user not found');

    // TODO: restrict area that can be searched e.g. by geolocation of current user

    const { latDelta, lonDelta } = this.config.geo;
    lat1 = lat1 ? lat1 : me.lat - latDelta;
    lat2 = lat2 ? lat2 : me.lat + latDelta;
    lon1 = lon1 ? lon1 : me.lon - lonDelta;
    lon2 = lon2 ? lon2 : me.lon + lonDelta;

    const sqlUsers = `
SELECT
  id, username, email_verified, phone_verified, lat, lon, geo_accuracy, created_at
FROM ${_.TBL_USER}
WHERE (lat BETWEEN $1 AND $2)
 AND (lon BETWEEN $3 AND $4)
`;
    
    const params = [lat1, lat2, lon1, lon2];

    const { result, error: user_search_err } = await this.db.query<at.UserSummary>(
      sqlUsers, params, 'users-in-area',
    );

    if (!result || user_search_err) throw user_search_err;
    
    data = result.rows;

    if (with_assets && data.length) {
      // with side effect on data
      data = await this.assetService.find_attach_assets<at.UserSummary>({ user, data, parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.USER });
    }

    return { data };
  }

  async usercontact_update({ user, id, input }) {
    // permission is checked by _isProtected()
    // let { first_name, last_name, email, phone, headline, neighbourhood } = input;
    const change = updateRow({ ...input, user }); // TODO: limit inputs?
    const condition = { id }; // TODO: for now, only user himself can update
    const { result, error } = await this.db.update(_.TBL_USER, condition, change, 1);
    return { data: result.success, error };
  }

  async usercontact_update_self({ user, input }) {
    // permission is checked by _isProtected()
    // let { first_name, last_name, email, phone, headline, neighbourhood } = input;
    const change = updateRow({ ...input, user }); // TODO: limit inputs?
    const condition = { id: user.id }; // TODO: for now, only user himself can update
    const { result, error } = await this.db.update(_.TBL_USER, condition, change, 1);
    return { data: result.success, error };
  }

  async usergeo_update({ user, id, input }) {
    // permission is checked by _isProtected()
    const { lat = 0, lon = 0, geo_accuracy = 9999 } = input;
    const now = new Date();
    const change = updateRow({ lat, lon, geo_accuracy, geo_updated_at: now, user });
    const condition = { id }; // TODO: for now, only user himself can update
    const { result, error } = await this.db.update(_.TBL_USER, condition, change, 1);
    return { data: result.success, error };
  }

  async usergeo_update_self({ user, input }) {
    // permission is checked by _isProtected()
    const { lat = 0, lon = 0, geo_accuracy = 9999 } = input;
    const now = new Date();
    const change = updateRow({ lat, lon, geo_accuracy, geo_updated_at: now, user });
    const condition = { id: user.id }; // TODO: for now, only user himself can update
    const { result, error } = await this.db.update(_.TBL_USER, condition, change, 1);
    return { data: result.success, error };
  }

  _api() {
    return {
      user_retrieve: this.user_retrieve,
      user_retrieve_by_username: this.user_retrieve_by_username,
      user_retrieve_self: this.user_retrieve_self,
      user_search: this.user_search,
      usercontact_update: this.usercontact_update,
      usercontact_update_self: this.usercontact_update_self,
      usergeo_update: this.usergeo_update,
      usergeo_update_self: this.usergeo_update_self,
    };
  }
}
