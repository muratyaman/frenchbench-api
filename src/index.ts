import 'dotenv/config'; // read .env file
import { factory } from './factory';

boot();

async function boot() {
  
  const f = await factory(process.env);

  if (f.httpServer) {
    f.httpServer.listen(f.config.http.port, () => {
      const host = `http://localhost:${f.config.http.port}`;
      console.info(new Date(), `FrenchBench API is ready at ${host}`);
    });
  }

  // shutdown
  process.on('SIGTERM', () => {
    // SIGTERM signal received: closing HTTP server
    if (f.httpServer) {
      f.httpServer.close(() => {
        // HTTP server closed
        
        // TODO: wait for possible pending requests?
        
        if (f.pool) f.pool.end();
      });
    }
  });
}
