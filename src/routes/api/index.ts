import { Request, Response } from 'express';
import { ErrUnauthorized, ErrUnknownAction, IApi, IConfig, CookieService, IDb, SecurityService, log, newUuid } from '../../lib';

export interface IApiHandler {
  (req: Request, res: Response): Promise<void>;
}

export function makeApiHandler(
  config: IConfig,
  cookieMgr: CookieService,
  securityMgr: SecurityService,
  db: IDb,
  api: IApi,
): IApiHandler {

  async function handleApi(req: Request, res: Response): Promise<void> {
    const t1 = new Date();
    
    const rid = newUuid();
    req['id'] = rid;

    log(rid, 'request START', req.body);
    let output = null, token = null;
    
    try {
      
      if (!config.IS_PRODUCTION_MODE) {
        const now = await db.now(); // make sure we can connect
        log(rid, 'db now', now);
      }

      const { user, error: tokenError } = securityMgr.getSessionUser(req);

      const { action = '', id = null, input = {} } = req.body;

      if (action && (action !== '_isAllowed') && (action in api)) {
        try {
          api._isAllowed({ action, user, id, input, tokenError }); // will throw error
        } catch (err) {
          if (err instanceof ErrUnauthorized) {
            token = '.'; // invalidate cookie
            throw err;
          }
        }
      } else {
        throw new ErrUnknownAction();
      }

      output = await api[action]({ user, id, input }); // run api action

      if (output && output.data && output.data.token) { // special case
        token = output.data.token;
      }

    } catch (err) {
      log(rid, 'error', err);
      output = { error: err.message };
    }

    if (token) {
      const cookieStr = cookieMgr.serialize(token);
      res.setHeader('Set-Cookie', cookieStr); // keep auth token as cookie on frontend
    }

    const t2 = new Date();
    const delta = t2.getTime() - t1.getTime();
    log(rid, 'request END', delta, 'ms');

    // try to send status 200, always! HTTP is merely a way of talking to backend; no need for a RESTful service.
    res.setHeader('x-fb-time-ms', delta);
    res.setHeader('x-req-id', rid);
    res.json(output);
  }

  return handleApi;
}
