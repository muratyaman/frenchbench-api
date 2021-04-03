import 'dotenv/config'; // read .env file
import { newHttpServer } from './httpServer';
import { newConfig } from './lib';
import { newWebSocketServer } from './webSocketServer';

boot();

async function boot() {
  const config = newConfig(process.env);
  const { httpServer, pool, securityMgr, api } = await newHttpServer(config);
  
  const { webSocketServer, onHttpUpgrade } = await newWebSocketServer({ config, securityMgr, api });

  httpServer.on('upgrade', onHttpUpgrade);

  httpServer.listen(config.http.port, () => {
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
}
