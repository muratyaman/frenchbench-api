require('dotenv').config();

const DB_CLIENT_PG      = 'pg';
const DB_CLIENT_MYSQL   = 'mysql';
const DB_CLIENT_SQLITE3 = 'sqlite3';

function newDbConfig(env){
  const client = env.DB_CLIENT || DB_CLIENT_SQLITE3;
  let connection = null;
  let moreOptions = {};
  const pool = {
    min: 1,
    max: 5,
  };

  switch (client) {
    case DB_CLIENT_PG:
      connection = {
        host: env.PGHOST || '127.0.0.1',
        port: env.PGPORT || 5432,
        user: env.PGUSER,
        password: env.PGPASSWORD,
        database: env.PGDATABASE,
      };
      moreOptions = {};
      break;
    case DB_CLIENT_MYSQL:
      connection = {
        host: env.MYSQL_HOST,
        port: env.MYSQL_PORT,
        user: env.MYSQL_USER,
        password: env.MYSQL_PASSWORD,
        database: env.MYSQL_DATABASE,
      };
      moreOptions = {};
      break;
    case DB_CLIENT_SQLITE3:
      connection = env.SQLITE_FILE;
      break;
    default:
      console.warn('invalid db client', client);
  }

  return {
    client,
    connection,
    pool,
    useNullAsDefault: true,
    acquireConnectionTimeout: 10000, // 10 seconds
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
    ...moreOptions,
  };
}

module.exports = {
  development: newDbConfig(process.env),
  staging:     newDbConfig(process.env),
  production:  newDbConfig(process.env),
};
