import { v4 as newUuid } from 'uuid';
import { TBL_POST, TBL_USER } from '../../../../constants';

export function posts({ config, db, router }) {

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
    const { row: data, error } = await db.findOne(TBL_POST, 'id', id);
    res.json({ data, error });
  };

  const updatePost = async (req, res) => {
    const { user = null } = req;
    if (!user) return res.status(403).json({ error: 'forbidden' });

    let data = null, error = 'failed to update post';
    const { id = '' } = req.params;
    let { post_ref, title, content, tags } = req.body;
    const dt = new Date();

    const { row: postFound, error: findPostError } = await db.findOne(TBL_POST, 'id', id);
    if (findPostError) {
      console.error('updatePost findPostError', findPostError);
      error = findPostError.message;
    } else if (postFound) {
      if (postFound.user_id !== user.id) {
        return res.status(403).json({ error: 'forbidden' });
      }
      if (!title) title = 'my post at ' + dt.toISOString();
      if (!post_ref) post_ref = title;
      post_ref = makePostRef(post_ref);
      let change = { post_ref, title, content, tags, updated_at: dt };
      let { result, error: updatePostError } = await db.updateOne(TBL_POST, { id }, change);
      if (updatePostError) {
        console.error('updatePost updatePostError', updatePostError);
        error = updatePostError.message;
      } else {
        data = result;
      }
    }
    res.json({ data, error });
  };

  const findPosts = async (req, res) => {
    let data = [], error = null;
    const { q = '' } = req.query;
    const text = 'SELECT p.id, p.post_ref, p.title, u.username FROM ' + TBL_POST + ' p '
      + ' INNER JOIN ' + TBL_USER + ' u ON p.user_id = u.id '
      + ' WHERE (p.title LIKE $1)'
      + '    OR (p.content LIKE $1)'
      + '    OR (p.tags LIKE $1)';
    const { result, error: findError } = await db.query(text, [ `%${q}%` ], 'posts-text-search');
    data = result && result.rows ? result.rows.map(row => {
      // send less data
      delete row.content;
      delete row.tags;
      row['uri'] = '/api/v1/users/' + row.username + '/posts/' + row.post_ref;
      return row;
    }) : [];
    res.json({ data, error });
  };

  router.post('/', createPost);
  router.get('/:id', retrievePost);
  router.patch('/:id', updatePost);
  router.get('/', findPosts);

  return router;
}
