/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js', '**/*.test.js', '**/*.spec.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/index.js'],
  coverageThresholds: {
    global: { branches: 70, functions: 70, lines: 70, statements: 70 },
  },
};
