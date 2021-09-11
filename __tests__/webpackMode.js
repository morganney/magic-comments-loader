import { webpackMode } from '../src/webpackMode.js'

describe('webpackMode', () => {
  it('returns a "webpackMode" magic comment', () => {
    const testPath = 'some/test/module.js'
    const testImportPath = './some/import/path'

    expect(webpackMode(testPath, testImportPath, 'eager')).toEqual('webpackMode: "eager"')
    expect(webpackMode(testPath, testImportPath, { config: { mode: 'lazy' } })).toEqual(
      'webpackMode: "lazy"'
    )
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
