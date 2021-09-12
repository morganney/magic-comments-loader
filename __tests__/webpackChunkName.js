import { webpackChunkName } from '../src/webpackChunkName.js'

describe('webpackChunkName', () => {
  it('returns a "webpackChunkName" magic comment', () => {
    const testPath = 'some/test/module.js'
    const testImportPath = './some/import/path'
    const testImportPathExt = './some/import/path.js'

    expect(webpackChunkName(testPath, testImportPath, true)).toEqual(
      'webpackChunkName: "some-import-path"'
    )
    expect(webpackChunkName(testPath, testImportPath, false)).toEqual('')
    expect(webpackChunkName(testPath, testImportPath, 'some/**/*.js')).toEqual(
      'webpackChunkName: "some-import-path"'
    )
    expect(
      webpackChunkName(testPath, testImportPath, ['some/**/*.js', '!some/test/*.js'])
    ).toEqual('')
    expect(
      webpackChunkName(testPath, testImportPathExt, 'some/import/**/*.js', 'import')
    ).toEqual('webpackChunkName: "some-import-path"')
    expect(
      webpackChunkName(testPath, testImportPath, 'some/import/**', 'import')
    ).toEqual('webpackChunkName: "some-import-path"')
    expect(
      webpackChunkName(testPath, testImportPathExt, 'some/import/**/*.js', 'module')
    ).toEqual('')
    expect(webpackChunkName(testPath, testImportPath, () => 'test-chunk')).toEqual(
      'webpackChunkName: "test-chunk"'
    )
    expect(
      webpackChunkName(testPath, testImportPath, {
        config: { active: () => true, basename: true }
      })
    ).toEqual('webpackChunkName: "path"')
    expect(
      webpackChunkName(testPath, testImportPath, {
        config: { basename: true },
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
    expect(
      webpackChunkName(testPath, testImportPath, {
        config: { basename: true },
        overrides: [
          {
            files: 'notsome/**/*.js',
            config: {
              active: false
            }
          }
        ]
      })
    ).toEqual('webpackChunkName: "path"')
    expect(webpackChunkName(testPath, './dynamic/${path}.json', true)).toEqual(
      'webpackChunkName: "dynamic-[request]"'
    )
    expect(webpackChunkName(testPath, './${path}.json', true)).toEqual(
      'webpackChunkName: "[request]"'
    )
  })
})
