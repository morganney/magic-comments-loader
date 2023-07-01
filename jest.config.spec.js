export default {
  collectCoverage: true,
  collectCoverageFrom: ['**/src/**/*.js', '!**/node_modules/**'],
  coverageProvider: 'babel',
  coverageReporters: ['json', 'lcov', 'clover', 'text', 'text-summary'],
  modulePathIgnorePatterns: ['dist'],
  /**
   * Use alternative runner to circumvent segmentation fault when
   * webpack's node.js API uses dynamic imports while running
   * jest's v8 vm context code.
   *
   * @see https://github.com/nodejs/node/issues/35889
   * @see https://github.com/nodejs/node/issues/25424
   */
  runner: 'jest-light-runner',
  testMatch: ['**/__tests__/**/*.spec.js'],
  transform: {}
}
