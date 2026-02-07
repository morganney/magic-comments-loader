export default {
  collectCoverage: true,
  collectCoverageFrom: ['**/src/**/*.js', '!**/node_modules/**'],
  coverageProvider: 'v8',
  coverageReporters: ['json', 'lcov', 'clover', 'text', 'text-summary'],
  modulePathIgnorePatterns: ['dist'],
  testMatch: ['**/__tests__/**/*.spec.js', '**/__tests__/parser.js'],
  transform: {}
}
