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
import { ErrBadRequest, ErrNotFound } from '../../../errors';

export function auth({ config, db, router, mw }) {

  const signup = async (req, res) => {
    let data = null, error = null;
    try {
      let { username = '', password = '', password_confirm = '' } = req.body;
      const usernamePruned = pruneUsername(username);
      if (usernamePruned !== username) {
        throw new ErrBadRequest('invalid username');
      }
      if (!(password && password !== '' && password === password_confirm)) {
        throw new ErrBadRequest('enter a strong password');
      }
      if (!isStrongPassword(password)) {
        throw new ErrBadRequest('enter a strong password');
      }

      const { row: userFound, error: userLookupError } = await db.findOne(TBL_USER, 'username', username);
      if (userFound) throw new ErrBadRequest('enter another username');
      if (userLookupError) { // this is unexpected
        // throw new ErrBadRequest('enter another username');
        throw new Error('there was an error, please try again later');
      }
      const password_hash = await hashPassword(password);
      if (!password_hash) { // this is unexpected
        throw new Error('there was an error, please try again later');
      }
      const id = newUuid(), dt = new Date();
      const userRow = {
        id,
        created_at: dt,
        updated_at: dt,
        username,
        password_hash,
      };
      const { result, error: insertError } = await db.insertOne(TBL_USER, userRow);
      if (insertError) { // this is unexpected
        // throw insertError;
        throw new Error('there was an error, please try again later');
      }

      data = result && result.rowCount ? id : null;
    } catch (err) {
      error = err.message;
    }
    res.json({ data, error });
  };

  const signin = async (req, res) => {
    let data, token, error = 'Invalid credentials';
    try {
      let { username = '', password = '' } = req.body;
      username.trim().toLowerCase();
      if (!(username && username !== '' && password && password !== '')) throw new Error(error);

      const { row: found, error: userLookupError } = await db.findOne(TBL_USER, 'username', username);
      if (userLookupError) throw userLookupError;
      if (!found) throw new ErrNotFound(error);

      const passwordOK = await verifyPassword(password, found.password_hash);
      if (!passwordOK) throw new Error(error);

      const { id } = found;
      const userData = { id, username }; // TODO: do not use username, it may be updated by user
      token = jwtManager.sign(userData, config.jwt.secret, { expiresIn: '1d', algorithm: 'HS256' });
      data = { id, username, token };
      error = null;

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

  router.post('/register', signup);
  router.post('/signup', signup);

  router.post('/signin', signin);
  router.post('/login', signin);

  router.get('/me', me);

  return router;
}
