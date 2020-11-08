import { log, newUuid } from '../../lib';

export function makeApiHandler({ api, config, cookieMgr, db, securityMgr }) {

  async function handleApi(req, res) {
    const t1 = new Date();
    
    req.id = newUuid();

    log(req.id, 'request START');
    let output = null, user = null;
    
    try {
      
      if (!config.IS_PRODUCTION_MODE) {
        const now = await db.now(); // make sure we can connect
        log(req.id, 'db now', now);
      }

      user = securityMgr.getSessionUser(req);

      const { action = '', id = null, input = {} } = req.body;

      if (action && (action !== '_isAllowed') && (action in api)) {
        api._isAllowed({ action, user, id, input });
      } else {
        throw Error('invalid api action');
      }

      output = await api[action]({ user, id, input }); // run api action

      if (output && output.data && output.data.token) { // special case
        const cookieStr = cookieMgr.serialize(output.data.token);
        res.setHeader('Set-Cookie', cookieStr); // keep auth token as cookie on frontend
      }

    } catch (err) {
      log(req.id, 'error', err);
      output = { error: err.message };
    }

    const t2 = new Date();
    const delta = t2.getTime() - t1.getTime();
    log(req.id, 'request END', delta, 'ms');

    // try to send status 200, always! HTTP is merely a way of talking to backend; no need for a RESTful service.
    res.setHeader('x-fb-time-ms', delta);
    res.json(output);
  }

  return handleApi;
}
