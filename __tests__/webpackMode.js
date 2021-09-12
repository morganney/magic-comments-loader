import { webpackMode } from '../src/webpackMode.js'

describe('webpackMode', () => {
  it('returns a "webpackMode" magic comment', () => {
    const testPath = 'some/test/module.js'
    const testImportPath = './some/import/path'

    expect(webpackMode(testPath, testImportPath, true)).toEqual('webpackMode: "lazy"')
    expect(webpackMode(testPath, testImportPath, false)).toEqual('')
    expect(webpackMode(testPath, testImportPath, 'eager')).toEqual('webpackMode: "eager"')
    expect(webpackMode(testPath, testImportPath, () => 'lazy-once')).toEqual(
      'webpackMode: "lazy-once"'
    )
    expect(webpackMode(testPath, testImportPath, () => 'invalid')).toEqual('')
    expect(
      webpackMode(testPath, testImportPath, {
        config: { mode: 'lazy', active: () => true }
      })
    ).toEqual('webpackMode: "lazy"')
    expect(
      webpackMode(testPath, testImportPath, {
        config: { mode: () => 'weak' }
      })
    ).toEqual('webpackMode: "weak"')
    expect(
      webpackMode(testPath, testImportPath, {
        config: { mode: 'weak' },
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
