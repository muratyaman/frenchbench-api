import { expect } from 'chai';
import dotenv from 'dotenv';
import request from 'supertest';
import { bootSimple } from'../src/bootSimple';

dotenv.config(); // read .env file

describe('FB API', () => {
  const app = bootSimple({ penv: process.env, cwd: process.cwd() });
  const config = app.get('config');
  const agent = request.agent(app);

  it('should respond for /api', (done) => {
    agent.get('/api')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        expect(res.body.version).to.equal(config.version);
        done();
      });
  });

});
