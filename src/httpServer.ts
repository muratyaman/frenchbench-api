import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import morgan from 'morgan';
import responseTime from 'response-time';
import { IApi, IConfig, CookieService, IDb, FileService, SecurityService } from './lib';
import { makeApiHandler } from './routes/api';
import { makeApiUploadHandler } from './routes/api/upload';

export function newHttpServer(
  config: IConfig,
  cookieMgr: CookieService,
  securityMgr: SecurityService,
  fileMgr: FileService,
  db: IDb,
  api: IApi,
) {
  const expressApp = express();

  expressApp.use(responseTime());
  expressApp.use(morgan('combined')); // access logs
  
  expressApp.use(cors()); // TODO: enable in dev mode

  // expressApp.use(helmet()); // security headers // TODO: disable in dev mode
  expressApp.use(express.json());
  expressApp.use(express.urlencoded({ extended: true }));

  expressApp.post('/api/upload', makeApiUploadHandler(fileMgr, securityMgr));
  expressApp.post('/api',        makeApiHandler(config, cookieMgr, securityMgr, db, api));

  const health = (req, res) => res.json({ ts: new Date() });
  expressApp.get('/api/health', health);
  expressApp.get('/api', health);
  expressApp.get('/', health);

  const httpServer = createServer(expressApp);

  return {
    httpServer,
    expressApp,
  };
}
