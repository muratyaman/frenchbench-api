import session from 'express-session';
//const KnexSessionStore = require('connect-session-knex')(session);

export function initSessionMiddleware({ config, logger, dbAdapterFb }) {
  logger.info('init session middleware');

  /*const store = new KnexSessionStore({
    knex: dbAdapterFb,
    // tablename: 'sessions', // optional. Defaults to 'sessions'
    // sidfieldname: 'sid'    // Field name in table to use for storing session ids
    // createtable: true,     // if the table for sessions should be created automatically or not
    // clearInterval: 60000,  // milliseconds between clearing expired sessions
  });*/

  return session({
    ...config.session,
    //store,
  });
}
