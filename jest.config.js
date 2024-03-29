export default {
  collectCoverage: false,
  collectCoverageFrom: ['**/src/**/*.js', '!**/node_modules/**'],
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'text-summary'],
  modulePathIgnorePatterns: ['dist'],
  testMatch: [
    '**/__tests__/**/*.js',
    '!**/__tests__/**/*.spec.js',
    '!**/__tests__/__fixtures__/**/*.js'
  ],
  transform: {}
}
