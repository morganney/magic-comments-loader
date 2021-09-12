import { webpackIgnore } from '../src/webpackIgnore.js'

describe('webpackIgnore', () => {
  it('returns a "webpackIgnore" magic comment', () => {
    const testPath = 'some/test/module.js'
    const testImportPath = './some/import/path'

    expect(webpackIgnore(testPath, testImportPath, true)).toEqual('webpackIgnore: true')
    expect(webpackIgnore(testPath, testImportPath, 'some/**/*.js')).toEqual(
      'webpackIgnore: true'
    )
    expect(
      webpackIgnore(testPath, testImportPath, { config: { active: false } })
    ).toEqual('')
    expect(
      webpackIgnore(testPath, testImportPath, { config: { active: () => true } })
    ).toEqual('webpackIgnore: true')
    expect(
      webpackIgnore(testPath, testImportPath, {
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
    ).toEqual('webpackIgnore: true')
  })
})
