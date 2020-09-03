import supertest from 'supertest';
import dotenv from 'dotenv';
import boot from '../src/boot';
import prepDb from './prepDb';

// read .env file
dotenv.config();

// override any process.env settings/props
process.env.DB_CLIENT = 'sqlite3';
process.env.DB_FILE = ':memory:';

describe('FB API', () => {
  let expressServer, request;

  beforeAll(async () => {
    console.info('beforeAll');
    const httpApp = boot();
    const db = httpApp.dbAdapterTests.db;
    await prepDb(db);
    expressServer = httpApp.server();
    request = supertest(expressServer);
  });

  afterAll(async () => {
    //console.info('beforeAll');
  });

  beforeEach(() => {
    //console.info('beforeEach');
  });

  afterEach(() => {
    //console.info('beforeEach');
  });

  it('should respond', async () => {
    const res = await request.get('/v1');
    expect(res.statusCode).toEqual(200);
    expect(res.body.hasOwnProperty('ts')).toEqual(true);
    expect(res.body.hasOwnProperty('version')).toEqual(true);
  });

  it('should get test data', async () => {
    const res = await request.get('/v1/test');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toEqual(true);
    expect(res.body.data.length > 0).toEqual(true);
  });


});
