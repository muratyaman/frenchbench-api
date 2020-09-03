export default async function jestSetup() {
  try {
    console.log('do something');
    return Promise.resolve(true);
  } catch (err) {
    console.error(err);
    return Promise.resolve(false);
  }
}
