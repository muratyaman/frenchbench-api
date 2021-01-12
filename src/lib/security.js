import bcrypt from 'bcrypt';
import jwtManager from 'jsonwebtoken';
import * as _ from './constants';
import { log } from './utils';

export function newSecurityMgr({ config, cookieMgr }) {

  function getSessionUser(req) {
    let user = null, error = null;
    try { // do we have a user session?
      let token = null, tokenType = null;
      const { cookie = null, authorization = null } = req.headers;
      if (cookie) { // do we have a session cookie?
        tokenType = _.TOKEN_TYPE_BEARER;
        token = cookieMgr.parse(cookie);
      } else if (authorization) { // do we have an authorization header?
        const authParts = authorization.split(' '); // e.g. 'Bearer a-long-json-web-token'
        tokenType = authParts[0];
        token = authParts[1];
      }
      if (token && tokenType && tokenType.toLowerCase() === _.TOKEN_TYPE_BEARER) {
        const decoded = jwtManager.verify(token, config.jwt.secret);
        log(req.id, 'token', decoded); // e.g. { id: 'uuid', username: 'haci', iat: 1601748833, exp: 1601835233 }
        user = decoded;
      }
    } catch (jwtError) {
      error = jwtError.message;
      log(req.id, 'token error', jwtError.message);
    }
    return { user, error };
  }

  /**
   * Remove all chars but a-z, A-Z, 0-9, '.', '-', '_'
   * @param {string} username
   * @returns {string}
   */
  function pruneUsername(username) {
    return String(username).replace(_.USERNAME_NOT_ACCEPTABLE_CHAR, '');
  }

  /**
   * Check password
   * 1. has length over 9
   * 2. has 1 of a-z
   * 3. has 1 of A-Z
   * 4. has 1 of 0-9
   * 5. has 1 of special characters
   * @param {string} password
   * @returns {boolean}
   */
  function isStrongPassword(password) {
    let s = String(password);
    return _.MIN_PASSWORD_LEN <= s.length
      && _.HAS_LOWERCASE_CHAR.test(s)
      && _.HAS_UPPERCASE_CHAR.test(s)
      && _.HAS_DIGIT.test(s)
      && _.HAS_SPECIAL_CHAR.test(s);
  }

  /**
   * Create hash for plain password
   * @param {string} plainPassword
   * @param {number} saltRounds
   * @returns {Promise<string>}
   */
  async function hashPassword(plainPassword, saltRounds = 10) {
    // store hash in your db
    return bcrypt.hash(plainPassword, saltRounds);
  }

  /**
   * Verify password
   * @param {string} plainPassword
   * @param {string} password_hash
   * @returns {Promise<Boolean>}
   */
  async function verifyPassword(plainPassword, password_hash) {
    // result == true/false
    return bcrypt.compare(plainPassword, password_hash);
  }

  function hideSensitiveUserProps(row) {
    delete row.password_hash;
    return row;
  }

  return {
    getSessionUser,
    pruneUsername,
    isStrongPassword,
    hashPassword,
    verifyPassword,
    hideSensitiveUserProps,
  };
}
