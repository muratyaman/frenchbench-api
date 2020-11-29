import express from 'express';
import helmet from 'helmet';
import { createServer } from 'http';
import morgan from 'morgan';
import { Pool } from 'pg';
import responseTime from 'response-time';
import { newApi, newConfig, newCookieMgr, newDb, newFileMgr, newS3Client, newSecurityMgr } from './lib';
import { makeApiHandler } from './routes/api';
import { makeApiUploadHandler } from './routes/api/upload';

export async function newHttpServer(penv) {
  const expressApp = express();

  const config      = newConfig(penv);
  const cookieMgr   = newCookieMgr({ config });
  const securityMgr = newSecurityMgr({ config, cookieMgr });

  const pool = new Pool(); // we rely on default env keys and values for PostgreSQL
  const db   = newDb({ pool });
  const api  = newApi({ config, db, securityMgr });

  const s3      = newS3Client({ config });
  const fileMgr = newFileMgr({ config, s3 });

  expressApp.use(responseTime());
  expressApp.use(morgan('combined')); // access logs
  expressApp.use(helmet()); // security headers
  expressApp.use(express.json());
  expressApp.use(express.urlencoded({ extended: true }));

  expressApp.post('/api/upload', makeApiUploadHandler({ fileMgr, securityMgr }));
  expressApp.post('/api',        makeApiHandler({ api, config, cookieMgr, db, securityMgr }));

  expressApp.get('/api/health', (req, res) => res.json({ ts: new Date() }));
  expressApp.get('/api',        (req, res) => res.json({ ts: new Date() }));

  const httpServer = createServer(expressApp);

  return Promise.resolve({
    expressApp,
    config,
    cookieMgr,
    securityMgr,
    pool,
    db,
    api,
    s3,
    fileMgr,
    httpServer,
  });
}
