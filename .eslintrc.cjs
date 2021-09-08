module.exports = {
  env: {
    es6: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'plugin:jest/recommended',
    'plugin:prettier/recommended'
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: '2020',
    sourceType: 'module'
  },
  plugins: ['jest', 'prettier'],
  rules: {
    'no-console': 'error'
  }
}
