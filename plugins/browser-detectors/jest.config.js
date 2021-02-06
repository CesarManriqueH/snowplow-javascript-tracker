module.exports = {
  preset: 'ts-jest',
  reporters: ['jest-standard-reporter'],
  testEnvironment: 'jest-environment-jsdom-global',
  testEnvironmentOptions: {
    innerWidth: 1024,
    innerHeight: 768,
  },
};
