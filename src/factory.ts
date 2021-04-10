import { Server as HttpServer } from 'http';
import { Server as WebSocketServer } from 'ws';
import { Application } from 'express';
import { ApolloServer } from 'apollo-server-express';
import { Pool } from 'pg';
import * as lib from './lib';
import { newHttpServer } from './httpServer';
import { newGqlServer } from './gqlServer';
import { newWebSocketServer } from './webSocketServer';

export interface IFactory {
  config: lib.IConfig;
  cookieMgr?: lib.CookieService;
  securityMgr?: lib.SecurityService;
  emailMgr?: lib.EmailService;
  pool?: Pool;
  db?: lib.IDb;
  api?: lib.IApi;
  s3?: AWS.S3;
  fileMgr?: lib.FileService;
  httpServer?: HttpServer;
  expressApp?: Application;
  gqlServer?: ApolloServer;
  webSocketServer?: WebSocketServer;
}

export async function factory(penv: lib.IProcessEnv): Promise<IFactory> {
  const config = lib.newConfig(penv);
  const f: IFactory = { config };

  f.cookieMgr   = new lib.CookieService(f.config);
  f.securityMgr = new lib.SecurityService(f.config, f.cookieMgr);

  f.emailMgr = new lib.EmailService(f.config);

  f.pool = new Pool(); // we rely on default env keys and values for PostgreSQL
  f.db   = lib.newDb(f.pool);

  f.api  = lib.newApi(config, f.securityMgr, f.emailMgr, f.db);

  f.s3      = lib.newS3Client(f.config);
  f.fileMgr = new lib.FileService(f.config, f.s3);

  const httpOut = await newHttpServer(f.config, f.cookieMgr, f.securityMgr, f.fileMgr, f.db, f.api);
  f.httpServer = httpOut.httpServer;
  f.expressApp = httpOut.expressApp;

  f.gqlServer = await newGqlServer(f);

  const wsOut = await newWebSocketServer(f.config, f.securityMgr, f.api);
  f.httpServer.on('upgrade', wsOut.onHttpUpgrade);
  f.webSocketServer = wsOut.webSocketServer;

  return f;
}
