import { jest } from '@jest/globals'

import { webpackExclude } from '../src/webpackExclude.js'

describe('webpackExclude', () => {
  it('returns a "webpackExclude" magic comment', () => {
    const testPath = 'some/test/module.js'
    const testImportPath = './some/import/path'
    const regex = /path\/.+\.json$/
    const regexAsterisk = /\.js \**/
    const exclude = jest.fn(() => regex)
    const comment = webpackExclude(testPath, testImportPath, { config: { exclude } })

    expect(comment).toEqual(`webpackExclude: /${regex.source}/`)
    expect(exclude).toHaveBeenCalledWith('some/test/module.js', './some/import/path')
    expect(webpackExclude(testPath, testImportPath, true)).toEqual('')
    expect(webpackExclude(testPath, testImportPath, false)).toEqual('')
    expect(
      webpackExclude(testPath, testImportPath, {
        config: { active: () => true, exclude: () => new RegExp(regex, 'i') }
      })
    ).toEqual(`webpackExclude: /${regex.source}/i`)
    expect(
      webpackExclude(testPath, testImportPath, {
        config: { active: () => false, exclude: () => regex }
      })
    ).toEqual('')
    expect(
      webpackExclude(testPath, testImportPath, {
        config: { exclude: regex }
      })
    ).toEqual(`webpackExclude: /${regex.source}/`)
    expect(webpackExclude(testPath, testImportPath, () => regexAsterisk)).toEqual(
      `webpackExclude: /${regexAsterisk.source}\\/`
    )
    expect(
      webpackExclude(testPath, testImportPath, {
        config: { exclude: () => regex },
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
