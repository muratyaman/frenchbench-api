import { TBL_POST, TBL_USER } from '../../../../constants';
import { hideSensitiveUserProps } from '../../../security';
import { ErrNotFound } from '../../../errors';

export function users({ config, db, router, mw }) {

  const retrieveUser = async (req, res) => {
    let data = null, error = null;
    try {
      const { id = '' } = req.params;
      // TODO: analytics of 'views' per record per visitor per day
      const { row, error: findUserError } = await db.findOne(TBL_USER, 'id', id);
      if (findUserError) throw findUserError;
      data = hideSensitiveUserProps(row);
    } catch (err) {
      error = err.message;
    }
    res.json({ data, error });
  };

  const findUsers = async (req, res) => {
    let data = [], error = null;
    try {
      const { user } = req; // current user
      let { lat1 = 0, lon1 = 0, lat2 = 0, lon2 = 0 } = req.query;
      // TODO: restrict area that can be searched e.g. by geolocation of current user
      lat1 = lat1 ? lat1 : user.lat - config.geo.latDelta;
      lat2 = lat2 ? lat2 : user.lat + config.geo.latDelta;
      lon1 = lon1 ? lon1 : user.lon - config.geo.lonDelta;
      lon2 = lon2 ? lon2 : user.lon + config.geo.lonDelta;
      const { result, error: findUsersError } = await db.query(
        'SELECT * FROM ' + TBL_USER
        + ' WHERE (lat BETWEEN $1 AND $2)'
        + '   AND (lon BETWEEN $3 AND $4)',
        [lat1, lat2, lon1, lon2],
        'users-in-area',
      );
      if (findUsersError) throw findUsersError;
      data = result.rows.map(hideSensitiveUserProps);
    } catch (err) {
      error = err.message;
    }
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

  const retrievePostByUserAndRef = async (req, res) => {
    let data = null, error = null;
    try {
      let { username = '', post_ref = '' } = req.params;
      username = username.toLowerCase();
      post_ref = post_ref.toLowerCase();
      const { row: postOwner, error: userError } = await db.findOne(TBL_USER, 'username', username);
      if (userError) throw userError;
      if (!postOwner) throw new ErrNotFound('user not found');

      const text = 'SELECT * FROM ' + TBL_POST
        + ' WHERE (user_id = $1) AND (post_ref = $2)';
      const { result: posts, error: postError } = await db.query(text, [postOwner.id, post_ref], 'post-by-user-and-ref');
      if (postError) throw postError;
      if (posts && posts[0]) {
        // TODO: analytics of 'views' per record per visitor per day
        data = posts[0];
      } else {
        throw new ErrNotFound('post not found');
      }
    } catch (err) {
      console.error('retrievePostByUserAndRef error', err);
      error = err.message;
    }
    res.json({ data, error });
  };

  router.use(mw.loginRequired); // protect entire router

  router.patch('/:id/contact', mw.paramIdIsCurrentUserId);
  router.patch('/:id/contact', updateContact);
  router.patch('/:id/geo',     mw.paramIdIsCurrentUserId);
  router.patch('/:id/geo',     updateGeo);

  router.get('/:id', retrieveUser);
  router.get('/',    findUsers);
  router.get('/:username/posts/:post_ref', retrievePostByUserAndRef);

  return router;
}
