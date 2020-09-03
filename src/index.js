import http from 'http';
import dotenv from 'dotenv';
import { bootSimple } from './bootSimple';

dotenv.config(); // read .env file

const expressApp = bootSimple({ penv: process.env, cwd: process.cwd() });
const config = expressApp.get('config');

const server = http.createServer(expressApp);

server.listen(config.http.port,() => {
  const host = `http://localhost:${config.http.port}`;
  console.info(`FrenchBench API is ready at ${host}`);
});

// shutdown
process.on('SIGTERM', () => {
  console.debug('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.debug('HTTP server closed');
  });
});

export default {};
