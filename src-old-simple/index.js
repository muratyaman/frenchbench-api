require('dotenv').config(); // read .env file
const http = require('http');
const { bootSimple } = require('./bootSimple');

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
