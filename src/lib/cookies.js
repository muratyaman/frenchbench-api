import cookie from 'cookie';

export function newCookieMgr({ config }) {
  const { secretKeyName, sameSite, secure, maxAge, httpOnly, path } = config.cookies;

  function serialize(userSecret) {
    const options = { sameSite, secure, maxAge, httpOnly, path };
    return cookie.serialize(secretKeyName, userSecret, options);
  }

  function parse(cookieStr) {
    const cookies = cookie.parse(cookieStr);
    return cookies[secretKeyName] || null;
  }

  return {
    serialize,
    parse,
  }
}
