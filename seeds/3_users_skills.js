const { TBL_USER, TBL_USER_SKILL } = require('../src/constants');
const { randNum, randUserSkill, chainPromises } = require('../mocks/mockData');

export const seed = knex => {

  async function insertUserSkill(skill) {
    return knex(TBL_USER_SKILL).insert(skill);
  }

  async function insertSkillsForUser(user) {
    const L = randNum(20, 5);
    const slots = [...Array(L)].map((_, i) => i);
    // generate skills
    const skills = slots.map((_, order_idx) => {
      return randUserSkill(user, { order_idx });
    });
    return chainPromises(skills, insertUserSkill);
  }

  return knex(TBL_USER_SKILL).del()
                             .then(async () => {
      const users = await knex(TBL_USER).select();
      return chainPromises(users, insertSkillsForUser);
    });
};
