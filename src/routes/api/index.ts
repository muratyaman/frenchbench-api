import { Request, Response } from 'express';
import { IFactory } from '../../factory';
import { ErrUnauthorized, ErrUnknownAction, log, newUuid } from '../../fblib';

export interface IApiHandler {
  (req: Request, res: Response): Promise<void>;
}

export function makeApiHandler({ config, cookieMgr, securityMgr, db, api }: IFactory): IApiHandler {

  async function handleApi(req: Request, res: Response): Promise<void> {
    const t1 = new Date();
    
    const rid = newUuid();
    req['id'] = rid;

    log(rid, 'request START', req.body);
    let output = null, token = null;
    
    try {
      
      if (!config.IS_PRODUCTION_MODE) {
        const now = await db.now(); // make sure we can connect
        log(rid, 'db.now', now);
      }

      const { user, error: tokenError } = securityMgr.getSessionUser(req);

      const { action = '', id = null, input = {} } = req.body;
      const [ service, method ] = action.split('.');
      const { _isAllowed, _services, _actions } = api;

      if (service && method && (service in _services) && (method in _actions) && (method in _services[service])) {
        try {
          _isAllowed({ action: method, user, id, tokenError }); // will throw error
        } catch (err) {
          if (err instanceof ErrUnauthorized) {
            token = '.'; // invalidate cookie
            throw err;
          }
        }
      } else {
        throw new ErrUnknownAction();
      }

      output = await _services[service][method]({ user, id, input });

      if (output && output.data && output.data.token) { // special case
        token = output.data.token;
      }

    } catch (err) {
      log(rid, 'ERROR', err);
      output = { error: err.message };
    }

    if (token !== null) { // side-effect on api[action]
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
