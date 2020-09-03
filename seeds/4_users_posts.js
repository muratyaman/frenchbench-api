import { TBL_USER, TBL_USER_POST } from '../src/constants';
const { randNum, randUserPost, chainPromises } = require('../mocks/mockData');

export const seed = knex => {

  async function insertUserPost(post) {
    return knex(TBL_USER_POST).insert(post);
  }

  async function insertPostsForUser(user) {
    const L = randNum(5, 1);
    const slots = [...Array(L)].map((_, i) => i);
    // generate skills
    const skills = slots.map((_, order_idx) => {
      return randUserPost(user, { order_idx });
    });
    return chainPromises(skills, insertUserPost);
  }

  return knex(TBL_USER_POST).del()
                            .then(async () => {
      const users = await knex(TBL_USER).select();
      return chainPromises(users, insertPostsForUser);
    });
};
