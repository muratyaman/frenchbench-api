import { expect } from 'chai';
import request from 'supertest';
import { factory } from './factory';

describe('FB API', async () => {
  const penv = {};
  const f = await factory(penv);

  const config = f.config;
  const agent = request.agent(f.expressApp);

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
