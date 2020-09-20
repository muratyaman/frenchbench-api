const faker = require('faker');
const bcrypt = require('bcrypt');

async function passwordHash(password, saltRounds = 10) {
  return bcrypt.hash(password, saltRounds);
}
function nowStr() {
  return (new Date()).toISOString();
}
function randNum(max, min = 0) {
  return min + Math.floor(Math.random() * max);
}
function chainPromises(items, fn) {
  return items.reduce((promise, item) => {
    return promise.then(() => {
      return fn(item);
    });
  }, Promise.resolve());
}

function randPost(user, options = {}){
  const id = faker.random.uuid();
  const title = faker.lorem.sentence();
  return {
    id,
    user_id: user.id,
    title,
    post_ref: title.replace(' ', '-').toLowerCase(),
    content: faker.lorem.paragraph() + '\n\n' + faker.lorem.paragraph() + '\n\n' + faker.lorem.paragraph(),
    created_at: nowStr(),
    updated_at: nowStr(),
    created_by: user.id,
    updated_by: user.id,
  }
}

async function randUser(options = {}){
  const id = faker.random.uuid();
  const username = faker.internet.userName().toLowerCase();
  const password_hash = await passwordHash(faker.internet.password());
  return {
    id,
    username,
    password_hash,
    created_at: nowStr(),
    updated_at: nowStr(),
  }
}

module.exports = {
  randUser,
  randPost,
  randNum,
  chainPromises,
};
