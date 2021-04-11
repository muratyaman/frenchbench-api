import { Server as HttpServer } from 'http';
import { Server as WebSocketServer } from 'ws';
import { Application } from 'express';
import { ApolloServer } from 'apollo-server-express';
import { Pool } from 'pg';
import AWS from 'aws-sdk';
import { createTransport } from 'nodemailer';
import { CookieService, DbService, EmailService, FileService, IApi, IConfig, IProcessEnv, newApi, newConfig, SecurityService } from './lib';
import { newHttpServer } from './httpServer';
import { newGqlServer } from './gqlServer';
import { newWebSocketServer } from './webSocketServer';

export interface IFactory {
  // core props
  config: IConfig;
  pool: Pool;
  db: DbService;
  cookieMgr: CookieService;
  securityMgr: SecurityService;
  emailMgr: EmailService;
  s3: AWS.S3;
  fileMgr: FileService;
  api: IApi;
   // other props
  httpServer?: HttpServer;
  expressApp?: Application;
  gqlServer?: ApolloServer;
  webSocketServer?: WebSocketServer;
}

export async function factory(penv: IProcessEnv): Promise<IFactory> {
  const config = newConfig(penv);
  const { accessKeyId, secretAccessKey } = config.s3;
  
  const pool        = new Pool(); // we rely on default env keys and values for PostgreSQL
  const db          = new DbService(pool);
  const cookieMgr   = new CookieService(config);
  const securityMgr = new SecurityService(config, cookieMgr);
  const transport   = createTransport(config.smtp.transportOptions);
  const emailMgr    = new EmailService(config, transport);
  const s3          = new AWS.S3({ accessKeyId, secretAccessKey });
  const fileMgr     = new FileService(config, s3);
  const api         = newApi(config, db, securityMgr, emailMgr);

  const f: IFactory = {
    config,
    pool,
    db,
    cookieMgr,
    securityMgr,
    emailMgr,
    s3,
    fileMgr,
    api,
  };

  const httpOut = await newHttpServer(f);
  f.httpServer = httpOut.httpServer;
  f.expressApp = httpOut.expressApp;

  f.gqlServer = await newGqlServer(f);

  const wsOut = await newWebSocketServer(f);
  f.httpServer.on('upgrade', wsOut.onHttpUpgrade);
  f.webSocketServer = wsOut.webSocketServer;

  return f;
}
