import { v4 as newUuid } from 'uuid';
import jwtManager from 'jsonwebtoken';
import { TBL_USER } from '../../../../constants';
import {
  hashPassword,
  hideSensitiveUserProps,
  isStrongPassword,
  pruneUsername,
  verifyPassword,
} from '../../../security';

export function auth({ config, db, router, mw }) {

  const register = async (req, res) => {
    let { username = '', password = '', password_confirm = '' } = req.body;
    let data = null;

    if (!password || (password === '') || (password !== password_confirm)) {
      res.json({ data, error: 'check/confirm your password' });
      return;
    }

    if (!isStrongPassword(password)){
      res.json({ data, error: 'use a strong password' });
      return;
    }

    const usernamePruned = pruneUsername(username);
    if (usernamePruned !== username){
      res.json({ data, error: 'invalid username' });
      return;
    }

    const { row: userFound, error: userLookupError } = await db.findOne(TBL_USER, 'username', username);
    if (userFound || userLookupError) {
      res.json({ data, error: 'Enter another username' });
      return;
    }

    const password_hash = await hashPassword(password);
    const id = newUuid(), dt = new Date();
    const userRow = {
      id,
      created_at: dt,
      updated_at: dt,
      username,
      password_hash,
    };
    const { result, error } = await db.insertOne(TBL_USER, userRow);
    res.json({ data: 0 < result.rowCount ? id : null, error });
  };

  const login = async (req, res) => {
    let token, data, error = 'Invalid credentials';
    try {
      let { username, password } = req.body;
      if (username && password) {
        username = username.toLowerCase();
        const { row: found, error: userLookupError } = await db.findOne(TBL_USER, 'username', username);
        if (userLookupError) throw userLookupError;
        if (found && await verifyPassword(password, found.password_hash)) {
          const { id } = found;
          const userData = { id, username }; // TODO: do not use username, it may be updated by user
          token = jwtManager.sign(userData, config.jwt.secret, { expiresIn: '1d', algorithm: 'HS256' });
          data = { id, username, token };
          error = null;
        }
      }
    } catch (err) {
      error = err.message;
    }
    return res.json({ data, error });
  };

  const me = async (req, res) => {
    const { id = null } = req.user || {};
    const { row, error } = await db.findOne(TBL_USER, 'id', id);
    const data = hideSensitiveUserProps(row);
    res.json({ data, error });
  };

  router.post('/register', register);
  router.post('/login', login);
  router.get('/me', me);

  return router;
}
