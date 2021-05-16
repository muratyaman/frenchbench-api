import cookie from 'cookie';
import { IConfig } from './config';

export class CookieService {
  constructor(private config: IConfig) {}

  serialize(userSecret: string): string {
    const { secretKeyName, sameSite, secure, maxAge, httpOnly, path } = this.config.cookies;
    const options = { sameSite, secure, maxAge, httpOnly, path };
    return cookie.serialize(secretKeyName, userSecret, options);
  }

  parse(cookieStr: string): string | null {
    const { secretKeyName } = this.config.cookies;
    const cookies = cookie.parse(cookieStr);
    return cookies[secretKeyName] || null;
  }
}
