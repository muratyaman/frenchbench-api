import { TBL_POST, TBL_USER } from '../../../../constants';
import { hideSensitiveUserProps } from '../../../security';

export function users({ config, db, router }) {

  const retrieveUser = async (req, res) => {
    const { id = '' } = req.params;
    const { row, error } = await db.findOne(TBL_USER, 'id', id);
    const data = hideSensitiveUserProps(row);
    res.json({ data, error });
  };

  const findUsers = async (req, res) => {
    const { lat1 = 0, lon1 = 0, lat2 = 0, lon2 = 0 } = req.query;
    const { result, error } = await db.query(
      'SELECT * FROM ' + TBL_USER
        + ' WHERE (lat BETWEEN $1 AND $2)'
        + '   AND (lon BETWEEN $3 AND $4)',
      [ lat1, lat2, lon1, lon2 ],
      'users-by-geo',
    );
    const data = result.rows.map(hideSensitiveUserProps);
    res.json({ data, error });
  };

  const updateContact = async (req, res) => {
    const { id } = req.params;
    let { first_name, last_name, email, phone, headline, neighbourhood } = req.body;
    let change = { first_name, last_name, email, phone, headline, neighbourhood, updated_at: new Date() };
    let { result, error } = await db.updateOne(TBL_USER, { id }, change);
    res.json({ data: result, error });
  };

  const updateGeo = async (req, res) => {
    const { id } = req.params;
    let { lat, lon, raw_geo } = req.body;
    let change = { lat, lon, raw_geo, updated_at: new Date() };
    let { result, error } = await db.updateOne(TBL_USER, { id }, change);
    res.json({ data: result, error });
  };

  router.patch('/:id/contact', updateContact);
  router.patch('/:id/geo',     updateGeo);
  router.get('/:id',           retrieveUser);
  router.get('/',              findUsers);

  const retrievePostByUserAndRef = async (req, res) => {
    let data = null, error = 'not found';
    const { username = '', post_ref = '' } = req.params;
    const { row: user, error: userError } = await db.findOne(TBL_USER, 'username', username);
    if (userError) {
      console.error('retrievePostByUserAndRef userError', userError);
    } else if (user) {
      const text = 'SELECT * FROM ' + TBL_POST
        + ' WHERE (user_id = $1) AND (post_ref = $2)';
      const { result: posts, error: postError } = await db.query(text, [ user.id, post_ref ], 'post-by-user-and-ref');
      if (postError) {
        console.error('retrievePostByUserAndRef postError', postError);
      } else if (posts && posts[0]) {
        data = posts[0];
      }
    }
    res.json({ data, error });
  };

  router.get('/:username/posts/:post_ref', retrievePostByUserAndRef);

  return router;
}
