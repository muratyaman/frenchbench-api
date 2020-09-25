import express from 'express';
import { dbLib, middleware, newConfig, routers } from './simple';

export function bootSimple({ penv, cwd }) {
  // express http server
  const expressApp = express();

  const config = newConfig({ penv, cwd });
  const db     = dbLib.newDb({ config });
  const mw     = middleware({ config });

  expressApp.set('config', config);
  expressApp.set('db', db);

  //expressApp.set('x-powered-by', false);
  expressApp.use(mw.requestIdAndTs);
  expressApp.use(mw.accessLogs);
  expressApp.use(mw.securityHeaders);
  expressApp.use(mw.cookies);
  expressApp.use(mw.jsonBody);
  expressApp.use(mw.forms);
  expressApp.use(mw.jwtToken);
  expressApp.use(mw.timeTaken);

  expressApp.use('/api/v1/auth',   routers.api.v1.auth  ({ config, db, mw, router: express.Router() }));
  expressApp.use('/api/v1/health', routers.api.v1.health({ config, db, mw, router: express.Router() }));
  expressApp.use('/api/v1/posts',  routers.api.v1.posts ({ config, db, mw, router: express.Router() }));
  expressApp.use('/api/v1/users',  routers.api.v1.users ({ config, db, mw, router: express.Router() }));

  const apiInfo = (req, res) => res.json({ ts: new Date(), version: config.version });

  expressApp.get('/api', apiInfo);
  expressApp.get('/', apiInfo);

  expressApp.use(mw.errHandler);

  return expressApp;
}
