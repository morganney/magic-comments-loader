import { jest } from '@jest/globals'

import { webpackInclude } from '../src/webpackInclude.js'

describe('webpackInclude', () => {
  it('returns a "webpackInclude" magic comment', () => {
    const testPath = 'some/test/module.js'
    const testImportPath = './some/import/path'
    const regex = /path\/.+\.json$/
    const regexAsterisk = /\.js \**/
    const include = jest.fn(() => regex)
    const comment = webpackInclude(testPath, testImportPath, { config: { include } })

    expect(comment).toEqual(`webpackInclude: /${regex.source}/`)
    expect(include).toHaveBeenCalledWith('some/test/module.js', './some/import/path')
    expect(webpackInclude(testPath, testImportPath, true)).toEqual('')
    expect(webpackInclude(testPath, testImportPath, false)).toEqual('')
    expect(
      webpackInclude(testPath, testImportPath, {
        config: { active: () => true, include: () => new RegExp(regex, 'i') }
      })
    ).toEqual(`webpackInclude: /${regex.source}/i`)
    expect(
      webpackInclude(testPath, testImportPath, {
        config: { active: () => false, include: () => regex }
      })
    ).toEqual('')
    expect(
      webpackInclude(testPath, testImportPath, {
        config: { include: regex }
      })
    ).toEqual(`webpackInclude: /${regex.source}/`)
    expect(webpackInclude(testPath, testImportPath, () => regexAsterisk)).toEqual(
      `webpackInclude: /${regexAsterisk.source}\\/`
    )
    expect(
      webpackInclude(testPath, testImportPath, {
        config: { include: () => regex },
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
