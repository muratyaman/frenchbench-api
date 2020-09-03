import { TBL_USER } from '../src/constants';
const { randUser, chainPromises } = require('../mocks/mockData');

export const seed = knex => {
  return knex(TBL_USER).del()
                       .then(async () => {
      const slots = [...Array(100)].map((_, i) => i);
      return chainPromises(slots, async () => {
        const user = await randUser();
        return knex(TBL_USER).insert(user);
      });
    });
};
