import { webpackFetchPriority } from '../src/webpackFetchPriority.js'

describe('webpackFetchPriority', () => {
  it('returns a "webpackFetchPriority" magic comment', () => {
    const testPath = 'some/test/module.js'
    const testImportPath = './some/import/path'

    expect(webpackFetchPriority(testPath, testImportPath, true)).toEqual(
      'webpackFetchPriority: "auto"'
    )
    expect(webpackFetchPriority(testPath, testImportPath, false)).toEqual('')
    expect(webpackFetchPriority(testPath, testImportPath, 'high')).toEqual(
      'webpackFetchPriority: "high"'
    )
    expect(webpackFetchPriority(testPath, testImportPath, () => 'low')).toEqual(
      'webpackFetchPriority: "low"'
    )
    expect(webpackFetchPriority(testPath, testImportPath, () => 'invalid')).toEqual('')
    expect(
      webpackFetchPriority(testPath, testImportPath, {
        config: { fetchPriority: 'high', active: () => true }
      })
    ).toEqual('webpackFetchPriority: "high"')
    expect(
      webpackFetchPriority(testPath, testImportPath, {
        config: { fetchPriority: () => 'high' }
      })
    ).toEqual('webpackFetchPriority: "high"')
    expect(
      webpackFetchPriority(testPath, testImportPath, {
        config: { fetchPriority: 'auto' },
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
