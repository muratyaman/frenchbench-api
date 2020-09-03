const dbConnectionConfig = require('../src/dbConnectionConfig');

describe('dbConnectionConfig', () => {

  it('should return config for mssql', () => {
    process.env.DB_CLIENT = 'mssql';
    const config = dbConnectionConfig('mssql', process.env);
    expect(config).toHaveProperty('host');
  });

  it('should return config for sqlite3', () => {
    process.env.DB_CLIENT = 'sqlite3';
    const config = dbConnectionConfig('sqlite3', process.env);
    expect(config).toHaveProperty('filename');
  });

  it('should return null config for others', () => {
    process.env.DB_CLIENT = 'x';
    const config = dbConnectionConfig('x', process.env);
    expect(config).toEqual(null);
  });

});
