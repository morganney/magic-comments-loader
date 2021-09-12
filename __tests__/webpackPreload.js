import { webpackPreload } from '../src/webpackPreload.js'

describe('webpackPreload', () => {
  it('returns a "webpackPreload" magic comment', () => {
    const testPath = 'some/test/module.js'
    const testImportPath = './some/import/path'

    expect(webpackPreload(testPath, testImportPath, true)).toEqual('webpackPreload: true')
    expect(webpackPreload(testPath, testImportPath, 'some/**/*.js')).toEqual(
      'webpackPreload: true'
    )
    expect(
      webpackPreload(testPath, testImportPath, { config: { active: false } })
    ).toEqual('')
    expect(
      webpackPreload(testPath, testImportPath, { config: { active: () => true } })
    ).toEqual('webpackPreload: true')
    expect(webpackPreload(testPath, testImportPath, () => true)).toEqual(
      'webpackPreload: true'
    )
    expect(webpackPreload(testPath, testImportPath, () => false)).toEqual('')
    expect(
      webpackPreload(testPath, testImportPath, {
        config: { active: false },
        overrides: [
          {
            files: 'some/**/*.js',
            config: {
              active: true
            }
          }
        ]
      })
    ).toEqual('webpackPreload: true')
  })
})
