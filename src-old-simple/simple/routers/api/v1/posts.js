import { v4 as newUuid } from 'uuid';
import { TBL_POST, TBL_USER } from '../../../../constants';
import { ErrNotFound } from '../../../errors';

export function posts({ config, db, router, mw }) {

  const makePostRef = (post_ref = '') => {
    let ref = post_ref.replace(/[^a-zA-Z0-9]/, '-');
    if (ref === '') ref = (new Date()).toISOString();
    return ref;
  }

  const createPost = async (req, res) => {
    const { user = null } = req;
    if (!user) return res.status(403).json({ error: 'forbidden' });

    let { post_ref = '', title = '', content = '', tags = '' } = req.body;
    const dt = new Date();
    const id = newUuid();
    if (!title) title = 'my post at ' + dt.toISOString();
    if (!post_ref) post_ref = title;
    post_ref = makePostRef(post_ref);
    const row = {
      id,
      created_at: dt,
      updated_at: dt,
      user_id: user.id,
      created_by: user.id,
      updated_by: user.id,
      post_ref,
      title,
      content,
      tags,
    };
    const { result, error } = await db.insertOne(TBL_POST, row);
    res.json({ data: 0 < result.rowCount ? id : null, error });
  };

  const retrievePost = async (req, res) => {
    const { id = '' } = req.params;
    // TODO: validate uuid
    const { row: data, error } = await db.findOne(TBL_POST, 'id', id);
    res.json({ data, error });
  };

  const updatePost = async (req, res) => {
    let data = null, error = null;
    try {
      const { user = null } = req;

      const { id = '' } = req.params;
      let { post_ref, title, content, tags } = req.body;
      const dt = new Date();

      const { row: postFound, error: findPostError } = await db.findOne(TBL_POST, 'id', id);
      if (findPostError) throw findPostError;
      if (!postFound) throw new ErrNotFound('post not found');

      if (postFound.user_id !== user.id) {
        return res.status(403).json({ error: 'forbidden' });
      }

      if (!title) title = 'my post at ' + dt.toISOString();
      if (!post_ref) post_ref = title;
      post_ref = makePostRef(post_ref);
      let change = { post_ref, title, content, tags, updated_at: dt, updated_by: user.id, };
      let { result, error: updatePostError } = await db.updateOne(TBL_POST, { id }, change);
      if (updatePostError) throw updatePostError;

      data = result;
    } catch (err) {
      error = err.message;
    }
    res.json({ data, error });
  };

  const findPosts = async (req, res) => {
    let data = [], error = null;
    try {
      let { q = '', offset = 0, limit = 10 } = req.query;
      if (100 < limit) limit = 100;
      const text = 'SELECT p.id, p.post_ref, p.title, p.tags, u.username FROM ' + TBL_POST + ' p'
        + ' INNER JOIN ' + TBL_USER + ' u ON p.user_id = u.id'
        + ' WHERE (p.title LIKE $1)'
        + '    OR (p.content LIKE $1)'
        + '    OR (p.tags LIKE $1)'
        + ' ORDER BY p.created_at DESC' // TODO: ranking, relevance
        + ' OFFSET $2'
        + ' LIMIT $3';
      const { result, error: findError } = await db.query(text, [`%${q}%`, offset, limit], 'posts-text-search');
      if (findError) throw findError;
      data = result && result.rows ? result.rows.map(row => {
        row['uri'] = '/api/v1/users/' + row.username + '/posts/' + row.post_ref;
        return row;
      }) : [];
    } catch (err) {
      error = err.message;
    }
    res.json({ data, error });
  };

  router.post('/', mw.loginRequired);
  router.post('/', createPost);

  router.patch('/:id', mw.loginRequired);
  router.patch('/:id', updatePost);

  router.get('/:id', retrievePost);
  router.get('/', findPosts);

  return router;
}
