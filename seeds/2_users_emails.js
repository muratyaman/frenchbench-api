import { TBL_USER, TBL_USER_EMAIL } from '../src/constants';

const { randNum, randUserEmail, chainPromises } = require('../mocks/mockData');

export const seed = knex => {

  async function insertUserEmail(post) {
    return knex(TBL_USER_EMAIL).insert(post);
  }

  async function insertEmailsForUser(user) {
    const L = randNum(2, 1);
    const slots = [...Array(L)].map((_, i) => i);
    // generate emails
    const skills = slots.map((_, order_idx) => {
      return randUserEmail(user, { order_idx });
    });
    return chainPromises(skills, insertUserEmail);
  }

  return knex(TBL_USER_EMAIL).del()
                             .then(async () => {
      const users = await knex(TBL_USER).select();
      return chainPromises(users, insertEmailsForUser);
    });
};
