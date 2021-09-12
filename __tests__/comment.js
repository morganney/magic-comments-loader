import { getCommenter } from '../src/comment.js'

describe('getCommenter', () => {
  it('creates a function for adding magic comments to imports', () => {
    expect(
      getCommenter('some/file/path.js', {
        webpackChunkName: true
      })('import("./some/test/module.js")', '"./some/test/module.js"')
    ).toBe('import(/* webpackChunkName: "some-test-module" */ "./some/test/module.js")')

    expect(
      getCommenter('some/file/path.js', {
        webpackChunkName: true,
        webpackMode: 'eager',
        webpackPrefetch: 'some/**/*.js',
        webpackPreload: false,
        webpackExports: () => ['a', 'b']
      })('import("./some/test/module")', '"./some/test/module"')
    ).toBe(
      'import(/* webpackChunkName: "some-test-module", webpackMode: "eager", webpackPrefetch: true, webpackExports: ["a", "b"] */ "./some/test/module")'
    )

    expect(
      getCommenter('some/file/path.js', {
        verbose: true,
        webpackPreload: true,
        webpackChunkName: true
      })('import("./some/test/module")', '"./some/test/module"')
    ).toBe(
      'import(/* webpackPreload: true, webpackChunkName: "some-test-module" */ "./some/test/module")'
    )

    expect(
      getCommenter('some/file/path.js', {
        webpackIgnore: true
      })('import("./some/test/module")', '"./some/test/module"')
    ).toBe('import(/* webpackIgnore: true */ "./some/test/module")')

    expect(
      getCommenter('some/file/path.js', {
        webpackChunkName: 'some/**/*.js'
      })('import("./some/test/module")', '"./some/test/module"')
    ).toBe('import(/* webpackChunkName: "some-test-module" */ "./some/test/module")')

    expect(
      getCommenter('some/file/path.js', {
        webpackExports: () => ['foo', 'bar']
      })('import("./some/test/module")', '"./some/test/module"')
    ).toBe('import(/* webpackExports: ["foo", "bar"] */ "./some/test/module")')

    expect(
      getCommenter('some/file/path.js', {
        webpackChunkName: false
      })('import("./some/test/module")', '"./some/test/module"')
    ).toBe('import("./some/test/module")')
  })
})
