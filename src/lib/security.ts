import bcrypt from 'bcrypt';
import { Request } from 'express';
import jwtManager from 'jsonwebtoken';
import * as _ from './constants';
import { log } from './utils';
import { IConfig } from './config';
import { ISessionUserAndError } from './types';
import { ICookieMgr } from './cookies';

export interface ISecurityMgr {
  getSessionUser(req: Request): ISessionUserAndError,
  pruneUsername(username: string): string,
  isStrongPassword(password: string): boolean,
  hashPassword(plainPassword: string, saltRounds?: number): Promise<string>,
  verifyPassword(plainPassword: string, password_hash: string): Promise<boolean>;
  hideSensitiveUserProps<T = Record<string, any>>(row: T): Omit<T, 'password' & 'password_hash'>;
}

export function newSecurityMgr(config: IConfig, cookieMgr: ICookieMgr): ISecurityMgr {

  function getSessionUser(req: Request): ISessionUserAndError {
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
        log(req['id'], 'token', decoded); // e.g. { id: 'uuid', username: 'haci', iat: 1601748833, exp: 1601835233 }
        user = decoded;
      }
    } catch (jwtError) {
      error = jwtError.message;
      log(req['id'], 'token error', jwtError.message);
    }
    return { user, error };
  }

  /**
   * Remove all chars but a-z, A-Z, 0-9, '.', '-', '_'
   */
  function pruneUsername(username: string): string {
    return String(username).replace(_.USERNAME_NOT_ACCEPTABLE_CHAR, '');
  }

  /**
   * Check password
   * 1. has length over 9
   * 2. has 1 of a-z
   * 3. has 1 of A-Z
   * 4. has 1 of 0-9
   * 5. has 1 of special characters
   */
  function isStrongPassword(password: string): boolean {
    const s = String(password);
    return _.MIN_PASSWORD_LEN <= s.length
      && _.HAS_LOWERCASE_CHAR.test(s)
      && _.HAS_UPPERCASE_CHAR.test(s)
      && _.HAS_DIGIT.test(s)
      && _.HAS_SPECIAL_CHAR.test(s);
  }

  /**
   * Create hash for plain password
   */
  async function hashPassword(plainPassword: string, saltRounds = 10): Promise<string> {
    // store hash in your db
    return bcrypt.hash(plainPassword, saltRounds);
  }

  /**
   * Verify password
   */
  async function verifyPassword(plainPassword: string, password_hash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, password_hash);
  }

  function hideSensitiveUserProps<T = Record<string, any>>(row: T): Omit<T, 'password' & 'password_hash'> {
    delete row['password'];
    delete row['password_hash'];
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
