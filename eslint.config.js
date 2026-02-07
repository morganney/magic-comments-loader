import js from '@eslint/js'
import jestPlugin from 'eslint-plugin-jest'
import babelParser from '@babel/eslint-parser'
import globals from 'globals'

export default [
  {
    ignores: ['dist', 'coverage', 'node_modules', '__tests__/__fixtures__/*']
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: babelParser,
      globals: {
        ...globals.node,
        ...globals.jest
      }
    },
    plugins: {
      jest: jestPlugin
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
      'no-console': 'error'
    }
  }
]
