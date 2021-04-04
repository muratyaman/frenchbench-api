import { Server as HttpServer } from 'http';
import { Server as WebSocketServer } from 'ws';
import { Application } from 'express';
import { ApolloServer } from 'apollo-server-express';
import { Pool } from 'pg';
import { newApi, newCookieMgr, newDb, newFileMgr, newS3Client, newSecurityMgr, newEmailMgr, IProcessEnv, newConfig, IConfig, ICookieMgr, ISecurityMgr, IEmailMgr, IDb, IFileMgr, IApi } from './lib';
import { newHttpServer } from './httpServer';
import { newGqlServer } from './gqlServer';
import { newWebSocketServer } from './webSocketServer';

export interface IFactory {
  config: IConfig;
  cookieMgr?: ICookieMgr;
  securityMgr?: ISecurityMgr;
  emailMgr?: IEmailMgr;
  pool?: Pool;
  db?: IDb;
  api?: IApi;
  s3?: AWS.S3;
  fileMgr?: IFileMgr;
  httpServer?: HttpServer;
  expressApp?: Application;
  gqlServer?: ApolloServer;
  webSocketServer?: WebSocketServer;
}

export async function factory(penv: IProcessEnv): Promise<IFactory> {
  const config = newConfig(penv);
  const f: IFactory = { config };

  f.cookieMgr   = newCookieMgr(f.config);
  f.securityMgr = newSecurityMgr(f.config, f.cookieMgr);

  f.emailMgr = newEmailMgr(f.config);

  f.pool = new Pool(); // we rely on default env keys and values for PostgreSQL
  f.db   = newDb(f.pool);
  f.api  = newApi(config, f.securityMgr, f.emailMgr, f.db);

  f.s3      = newS3Client(f.config);
  f.fileMgr = newFileMgr(f.config, f.s3);

  const httpOut = await newHttpServer(f.config, f.cookieMgr, f.securityMgr, f.fileMgr, f.db, f.api);
  f.httpServer = httpOut.httpServer;
  f.expressApp = httpOut.expressApp;

  f.gqlServer = await newGqlServer(f);

  const wsOut = await newWebSocketServer(f.config, f.securityMgr, f.api);
  f.httpServer.on('upgrade', wsOut.onHttpUpgrade);
  f.webSocketServer = wsOut.webSocketServer;

  return f;
}
