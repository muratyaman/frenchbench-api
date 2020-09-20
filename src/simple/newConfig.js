import { dbConnectionConfig } from './dbConnectionConfig';

export function newConfig({ penv, cwd }) {
  const config = {
    version: 'v1.0.0',
    http: {
      port: penv.HTTP_PORT || 12000,
    },
    log: {
      format: penv.LOG_FORMAT || '',
      file: penv.LOG_FILE || 'access.log',
      consoleOn: penv.NODE_ENV !== 'test',
    },
    db: {
      client: penv.DB_CLIENT || 'pg',
      connection: dbConnectionConfig(penv.DB_CLIENT || 'pg', penv),
      useNullAsDefault: true,
      pool: { min: 1, max: 5 },
      acquireConnectionTimeout: 10000,
      migrations: {
        tableName: 'gca_migrations_tests',
        directory: cwd + '/migrations',
      },
      seeds: {
        directory: cwd + '/seeds',
      },
    },
    pg: {
      poolOptions: {
        user:     penv.PGUSER || 'frenchbench',
        host:     penv.PGHOST || '127.0.0.1',
        database: penv.PGDATABASE || 'frenchbench',
        password: penv.PGPASSWORD || '',
        port:     penv.PGPORT || 5432,

        // number of milliseconds to wait before timing out when connecting a new client
        // by default this is 0 which means no timeout
        connectionTimeoutMillis: 10 * 1000,

        // number of milliseconds a client must sit idle in the pool and not be checked out
        // before it is disconnected from the backend and discarded default is 10000 (10 seconds)
        // set to 0 to disable auto-disconnection of idle clients
        idleTimeoutMillis: 5 * 60 * 1000,

        // maximum number of clients the pool should contain; by default this is set to 10
        max: 10,
      },
    },
    gql: {
      schemaFile: cwd + '/schema.graphql',
    },
    jwt: {
      secret: penv.JWT_SECRET || 'jwt-secret-here', // TODO: throw error
      credentialsRequired: false,
      algorithms: [ 'HS256' ],
    },
  };
  return config;
}
