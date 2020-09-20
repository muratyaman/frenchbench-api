import { TBL_USER, TBL_POST } from '../src/constants';
const { randNum, randPost, chainPromises } = require('../mocks/mockData');

export const seed = knex => {

  async function insertPost(post) {
    return knex(TBL_POST).insert(post);
  }

  async function insertPostsForUser(user) {
    const L = randNum(5, 1);
    const slots = [...Array(L)].map((_, i) => i);
    // generate posts
    const posts = slots.map((_, order_idx) => {
      return randPost(user, { order_idx });
    });
    return chainPromises(posts, insertPost);
  }

  return knex(TBL_POST).del()
                       .then(async () => {
      const users = await knex(TBL_USER).select();
      return chainPromises(users, insertPostsForUser);
    });
};
