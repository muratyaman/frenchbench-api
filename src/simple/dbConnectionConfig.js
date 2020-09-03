export function dbConnectionConfig(client, penv){
  let connection = null;
  let defaultHost = '127.0.0.1';
  let defaultPort = 0;
  let prefix = String(client).toUpperCase() + '_';
  switch (client) {
    case 'mssql': defaultPort = 1433; break;
    case 'mysql': defaultPort = 3306; break;
    case 'pg':    defaultPort = 5432; prefix = ''; break;
    default: break;
  }
  switch (client) {
    case 'mssql':
    case 'mysql':
    case 'pg':
      connection = {
        host: penv[prefix + 'DB_HOST'] || defaultHost,
        port: parseInt(penv[prefix + 'DB_PORT']) || defaultPort,
        user: penv[prefix + 'DB_USER'] || 'admin',
        password: penv[prefix + 'DB_PASS'] || '',
        database: penv[prefix + 'DB_NAME'] || 'gca_db',
      };
      break;
    case 'sqlite3':
      connection = {
        filename: penv[prefix + 'DB_FILE'],
      };
      break;
    default:
      break;
  }
  return connection;
}
