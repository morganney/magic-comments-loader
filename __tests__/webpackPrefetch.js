import { webpackPrefetch } from '../src/webpackPrefetch.js'

describe('webpackPrefetch', () => {
  it('returns a "webpackPrefetch" magic comment', () => {
    const testPath = 'some/test/module.js'
    const testImportPath = './some/import/path'

    expect(webpackPrefetch(testPath, testImportPath, true)).toEqual(
      'webpackPrefetch: true'
    )
    expect(webpackPrefetch(testPath, testImportPath, false)).toEqual('')
    expect(webpackPrefetch(testPath, testImportPath, 'some/**/*.js')).toEqual(
      'webpackPrefetch: true'
    )
    expect(
      webpackPrefetch(testPath, testImportPath, { config: { active: false } })
    ).toEqual('')
    expect(
      webpackPrefetch(testPath, testImportPath, { config: { active: () => true } })
    ).toEqual('webpackPrefetch: true')
    expect(webpackPrefetch(testPath, testImportPath, () => true)).toEqual(
      'webpackPrefetch: true'
    )
    expect(webpackPrefetch(testPath, testImportPath, () => false)).toEqual('')
    expect(
      webpackPrefetch(testPath, testImportPath, {
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
    ).toEqual('webpackPrefetch: true')
  })
})
