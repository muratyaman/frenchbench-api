import express from 'express';
import jwt from 'express-jwt';
import { dbLib, routers, newConfig } from './simple';
import { v4 as newUuid } from 'uuid';

export function bootSimple({ penv, cwd }) {
  // express http server
  const expressApp = express();

  const config = newConfig({ penv, cwd });
  const db     = dbLib.newDb({ config });

  expressApp.set('config', config);
  expressApp.set('db', db);

  expressApp.set('x-powered-by', false);

  const assignId = (req, res, next) => {
    req.ts = new Date();
    req.id = newUuid();
    console.debug('new request', req.id, req.ts);
    next();
  };
  expressApp.use(assignId);
  expressApp.use(express.json());
  expressApp.use(express.urlencoded({ extended: true }));
  expressApp.use(jwt(config.jwt));

  expressApp.use('/api/v1/auth',   routers.api.v1.auth  ({ config, db, router: express.Router() }));
  expressApp.use('/api/v1/health', routers.api.v1.health({ config, db, router: express.Router() }));
  expressApp.use('/api/v1/posts',  routers.api.v1.posts ({ config, db, router: express.Router() }));
  expressApp.use('/api/v1/users',  routers.api.v1.users ({ config, db, router: express.Router() }));

  const apiInfo = (req, res) => res.json({ ts: new Date(), version: config.version });

  expressApp.get('/api', apiInfo);
  expressApp.get('/', apiInfo);

  const errHandler = (err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
      res.status(401).json({ error: 'invalid token' });
      return;
    }
    res.status(500).json({ error: err });//err.message });
  };
  expressApp.use(errHandler);

  return expressApp;
}

export default {}
