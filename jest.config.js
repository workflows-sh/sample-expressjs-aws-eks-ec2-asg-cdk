module.exports = {
  verbose: false,
  testMatch: [
    '**/test/**/*test*.js',
  ],
  collectCoverageFrom: ['**/*.js', '!**/node_modules/**', '!**/test/**'],
  forceExit: true,
  globalSetup: './test/global-setup.js',
  globalTeardown: './test/global-teardown.js',
  testEnvironment: './prisma/test-environment.js',
  testTimeout: 15000,
};
