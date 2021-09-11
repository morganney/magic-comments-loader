import { webpackChunkName } from '../src/webpackChunkName.js'

describe('webpackChunkName', () => {
  it('returns a "webpackChunkName" magic comment', () => {
    const testPath = 'some/test/module.js'
    const testImportPath = './some/import/path'

    expect(webpackChunkName(testPath, testImportPath, true)).toEqual(
      'webpackChunkName: "some-import-path"'
    )
    expect(webpackChunkName(testPath, testImportPath, 'some/**/*.js')).toEqual(
      'webpackChunkName: "some-import-path"'
    )
    expect(
      webpackChunkName(testPath, testImportPath, ['some/**/*.js', '!some/test/*.js'])
    ).toEqual('')
    expect(
      webpackChunkName(testPath, testImportPath, { config: { basename: true } })
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
    expect(webpackChunkName(testPath, './dynamic/${path}.json', true)).toEqual(
      'webpackChunkName: "dynamic-[request]"'
    )
  })
})
