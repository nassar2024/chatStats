module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['jest-fetch-mock'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  reporters: [
    'default',
    ['<rootDir>/src/reporters/TestResultLogger.js', {}]
  ]
};