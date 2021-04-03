import cookie from 'cookie';
import { IConfig } from './config';

export interface ICookieMgrProps {
  config: IConfig;
}

export interface ICookieMgr {
  serialize(userSecret: string): string;
  parse(cookieStr: string): any;
}

export function newCookieMgr({ config }: ICookieMgrProps): ICookieMgr {
  const { secretKeyName, sameSite, secure, maxAge, httpOnly, path } = config.cookies;

  function serialize(userSecret: string): string {
    const options = { sameSite, secure, maxAge, httpOnly, path };
    return cookie.serialize(secretKeyName, userSecret, options);
  }

  function parse(cookieStr: string): any {
    const cookies = cookie.parse(cookieStr);
    return cookies[secretKeyName] || null;
  }

  return {
    serialize,
    parse,
  }
}
