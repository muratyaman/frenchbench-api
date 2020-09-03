import { TBL_SECRET, TBL_USER } from '../../../../constants';
import { v4 } from 'uuid';
import { hashPassword, isStrongPassword, pruneUsername } from '../../../security';

export function users({ db, router }) {

  const hideSensitive = row => {
    delete row.password_hash;
    return row;
  }

  const createUser = async (req, res) => {
    let { secret, email, username, password, password_confirm } = req.body;
    let data;

    const secretQuery = {
      name: 'secrets-find-one-by-email-and-secret',
      text: 'SELECT * FROM ' + TBL_SECRET + ' WHERE email = $1 AND secret = $2',
      values: [ email, secret ],
    }
    const { result: secretRow, error: secretError } = await db.findOne(secretQuery);
    if (secretError || !secretRow) {
      res.json({ data, error: 'check your email for secret code' });
      return;
    }

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
    const id = v4();
    const userRow = {
      id,
      created_at: new Date(),
      updated_at: new Date(),
      username,
      password_hash,
      created_by: id,
      updated_by: id,
    };
    const { result, error } = await db.insertOne(TBL_USER, userRow);
    res.json({ data: result.rowCount, error });
  };

  const retrieveUser = async (req, res) => {
    const { id } = req.params;
    const { row, error } = await db.findOne(TBL_USER, 'id', id);
    const data = hideSensitive(row);
    res.json({ data, error });
  };

  const findUsers = async (req, res) => {
    const { username } = req.query;
    const { result, error } = await db.query('SELECT * FROM ' + TBL_USER);
    const data = [...result.rows].forEach(row => { hideSensitive(row); });
    res.json({ data, error });
  };

  router.get('/:id', retrieveUser);
  router.get('/', findUsers);
  router.post('/', createUser);

  return router;
}
