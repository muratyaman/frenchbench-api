import 'dotenv/config'; // read .env file
import express from 'express';
import helmet from 'helmet';
import { createServer } from 'http';
import morgan from 'morgan';
import { Pool } from 'pg';
import responseTime from 'response-time';
import { newApi, newConfig, newCookieMgr, newDb, newFileMgr, newS3Client, newSecurityMgr } from './lib';
import { makeApiHandler } from './routes/api';
import { makeApiUploadHandler } from './routes/api/upload';

const expressApp = express();

const config      = newConfig(process.env);
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

httpServer.listen(config.http.port,() => {
  const host = `http://localhost:${config.http.port}`;
  console.info(`FrenchBench API is ready at ${host}`);
});

// shutdown
process.on('SIGTERM', () => {
  // SIGTERM signal received: closing HTTP server
  httpServer.close(() => {
    // HTTP server closed
    if (pool) pool.end();
  });
});
