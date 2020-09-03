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

const skills = [
  'Application Development',
  'Architecture',
  'Artificial Intelligence',
  'Cloud Computing',

  'HTML',
  'CSS',
  'C',
  'C++',
  'C#',
  'PHP',
  'UX',
  'UX Design',
  'Python',
  'JavaScript',
  'Java',
  'Ruby',

  'Team Building',
  'Teamwork',
  'Leadership',
  'Collaboration',
  'Communication',
  'Written Communication',
  'Oral Communication',
  'Active Listening',

  'Cyber Security',
  'Information Management',
  'Cloud Systems Administration',

  'Scheduling',
  'Goal Oriented',
  'Digital Communications',
  'Manage Remote Working Teams',
  'Continually Review Processes for Improvement',
  'Multitasking',
  'Meeting Deadlines',

  'Analytical',
  'Analyze and Recommend Database Improvements',
  'Analyze Impact of Database Changes to the Business',
  'Audit Database Access and Requests',
  'APIs',
  'Application and Server Monitoring Tools',
  'Attention to Detail',
  'AutoCAD',
  'Azure',
  'Configure Database Software',
  'Configuration Management',
  'Critical Thinking',
  'Database Administration',
  'Deploying Applications in a Cloud Environment',
  'Develop and Secure Network Structures',
  'Develop and Test Methods to Synchronize Data',
  'Emerging Technologies',
  'File Systems',
  'Implement Backup and Recovery Plan',
  'Implementation',
  'Information Systems',
  'Interaction Design',
  'Interaction Flows',
  'Install, Maintain, and Merge Databases',
  'Integrated Technologies',
  'Integrating Security Protocols with Cloud Design',
  'Internet',
  'Optimization',
  'IT Soft Skills',
  'Logical Thinking',
  'Leadership',
  'Operating Systems',
  'Migrating Existing Workloads into Cloud Systems',
  'Mobile Applications',
  'Open Source Technology Integration',
  'Optimizing Website Performance',
  'Problem Solving',
  'Project Management',
  'Software Engineering',
  'Software Quality Assurance (QA)',
  'TensorFlow',
  'User-Centered Design',
  'UI / UX',
  'Web Development',
  'Web Design',

];
const skillCount = skills.length;

const stars = [1, 2, 3, 4, 5];
const starCount = stars.length;

function randUserSkill(user, { order_idx }){
  const id = faker.random.uuid();
  return {
    id,
    user_id: user.id,
    skill: skills[randNum(skillCount)],
    stars: stars[randNum(starCount)],
    order_idx,
    created_at: nowStr(),
    updated_at: nowStr(),
    created_by: user.id,
    updated_by: user.id,
  }
}

function randUserPost(user, options = {}){
  const id = faker.random.uuid();
  const title = faker.lorem.sentence();
  return {
    id,
    user_id: user.id,
    title,
    post_ref: title.replace(' ', '-').toLowerCase(),
    summary: faker.lorem.sentences(),
    content: faker.lorem.paragraph() + '\n\n' + faker.lorem.paragraph() + '\n\n' + faker.lorem.paragraph(),
    created_at: nowStr(),
    updated_at: nowStr(),
    created_by: user.id,
    updated_by: user.id,
  }
}

function randUserEmail(user, options = {}){
  const id = faker.random.uuid();
  return {
    id,
    user_id: user.id,
    email: faker.internet.email(),
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
    created_by: id,
    updated_by: id,
  }
}

module.exports = {
  skills,
  stars,
  randUserSkill,
  randUserPost,
  randUserEmail,
  randUser,
  randNum,
  chainPromises,
};
