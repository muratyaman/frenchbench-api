import express from 'express';
import { dbLib, routers, newConfig } from './simple';

export function bootSimple({ penv, cwd }) {
  // express http server
  const expressApp = express();

  expressApp.set('x-powered-by', false);
  expressApp.use(express.json()); // for parsing application/json
  expressApp.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

  const config = newConfig({ penv, cwd });
  expressApp.set('config', config);

  const db = dbLib.newDb({ config });
  expressApp.set('db', db);

  expressApp.use('/api/v1/health',  routers.api.v1.health({ db, router: express.Router() }));
  expressApp.use('/api/v1/secrets', routers.api.v1.secrets({ db, router: express.Router() }));
  expressApp.use('/api/v1/users',   routers.api.v1.users({ db, router: express.Router() }));

  const apiInfo = (req, res) => res.json({ ts: new Date(), version: config.version });

  expressApp.get('/api', apiInfo);
  expressApp.get('/', apiInfo);

  return expressApp;
}

export default {}
