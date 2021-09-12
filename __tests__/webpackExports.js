import { jest } from '@jest/globals'

import { webpackExports } from '../src/webpackExports.js'

describe('webpackExports', () => {
  it('returns a "webpackExports" magic comment', () => {
    const testPath = 'some/test/module.js'
    const testImportPath = './some/import/path'
    const exports = jest.fn(() => ['mock'])
    const comment = webpackExports(testPath, testImportPath, { config: { exports } })

    expect(comment).toEqual('webpackExports: ["mock"]')
    expect(exports).toHaveBeenCalledWith('some/test/module.js', './some/import/path')
    expect(webpackExports(testPath, testImportPath, true)).toEqual('')
    expect(webpackExports(testPath, testImportPath, false)).toEqual('')
    expect(
      webpackExports(testPath, testImportPath, {
        config: { active: () => true, exports: () => ['one', 'two'] }
      })
    ).toEqual('webpackExports: ["one", "two"]')
    expect(
      webpackExports(testPath, testImportPath, {
        config: { exports: () => "'one', 'two'" }
      })
    ).toEqual('')
    expect(
      webpackExports(testPath, testImportPath, {
        config: { exports: () => ['a', 'b'] },
        overrides: [
          {
            files: 'some/**/*.js',
            config: {
              active: false
            }
          }
        ]
      })
    ).toEqual('')
  })
})
