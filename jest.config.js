module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/migrations/",
    "/seeds/"
  ],
  globalSetup: "./jest.setup.js"
};
