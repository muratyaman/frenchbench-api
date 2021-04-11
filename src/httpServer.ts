import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import morgan from 'morgan';
import responseTime from 'response-time';
import { makeApiHandler } from './routes/api';
import { makeApiUploadHandler } from './routes/api/upload';
import { IFactory } from './factory';

export type IHttpServer = ReturnType<typeof newHttpServer>;

export function newHttpServer(f: IFactory) {
  const expressApp = express();

  expressApp.use(responseTime());
  expressApp.use(morgan('combined')); // access logs
  
  expressApp.use(cors()); // TODO: enable in dev mode

  if (f.config.IS_PRODUCTION_MODE) expressApp.use(helmet()); // security headers // TODO: disable in dev mode
  expressApp.use(express.json());
  expressApp.use(express.urlencoded({ extended: true }));

  expressApp.post('/api/upload', makeApiUploadHandler(f));
  expressApp.post('/api',        makeApiHandler(f));

  expressApp.get('/api/echo',   f.api._services.echo.echo);
  expressApp.get('/api/health', f.api._services.health.health);
  expressApp.get('/api',        f.api._services.health.health);
  expressApp.get('/',           f.api._services.health.health);

  const httpServer = createServer(expressApp);

  return {
    httpServer,
    expressApp,
  };
}
