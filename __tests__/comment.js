import logging from 'webpack/lib/logging/runtime.js'

import { getCommenter } from '../src/comment.js'

describe('getCommenter', () => {
  const logger = logging.getLogger('MCL')

  it('creates a function for adding magic comments to imports', () => {
    expect(
      getCommenter(
        'some/file/path.js',
        {
          webpackChunkName: true
        },
        logger
      )('import("./some/test/module.js")', '"./some/test/module.js"')
    ).toBe('import(/* webpackChunkName: "some-test-module" */ "./some/test/module.js")')

    expect(
      getCommenter(
        'some/file/path.js',
        {
          webpackChunkName: true,
          webpackMode: 'eager',
          webpackPrefetch: 'some/**/*.js',
          webpackPreload: false,
          webpackExports: () => ['a', 'b']
        },
        logger
      )('import("./some/test/module")', '"./some/test/module"')
    ).toBe(
      'import(/* webpackChunkName: "some-test-module", webpackMode: "eager", webpackPrefetch: true, webpackExports: ["a", "b"] */ "./some/test/module")'
    )

    expect(
      getCommenter(
        'some/file/path.js',
        {
          verbose: true,
          webpackPreload: true,
          webpackChunkName: true
        },
        logger
      )('import("./some/test/module")', '"./some/test/module"')
    ).toBe(
      'import(/* webpackPreload: true, webpackChunkName: "some-test-module" */ "./some/test/module")'
    )

    expect(
      getCommenter(
        'some/file/path.js',
        {
          webpackIgnore: true
        },
        logger
      )('import("./some/test/module")', '"./some/test/module"')
    ).toBe('import(/* webpackIgnore: true */ "./some/test/module")')

    expect(
      getCommenter(
        'some/file/path.js',
        {
          webpackChunkName: 'some/**/*.js'
        },
        logger
      )('import("./some/test/module")', '"./some/test/module"')
    ).toBe('import(/* webpackChunkName: "some-test-module" */ "./some/test/module")')

    expect(
      getCommenter(
        'some/file/path.js',
        {
          webpackExports: () => ['foo', 'bar']
        },
        logger
      )('import("./some/test/module")', '"./some/test/module"')
    ).toBe('import(/* webpackExports: ["foo", "bar"] */ "./some/test/module")')

    expect(
      getCommenter(
        'some/file/path.js',
        {
          webpackChunkName: false
        },
        logger
      )('import("./some/test/module")', '"./some/test/module"')
    ).toBe('import("./some/test/module")')

    expect(
      getCommenter(
        'some/file/path.js',
        {
          webpackChunkName: false,
          webpackInclude: () => /path\/.+\.json$/
        },
        logger
      )('import("./some/test/module")', '"./some/test/module"')
    ).toBe('import(/* webpackInclude: /path\\/.+\\.json$/ */ "./some/test/module")')

    expect(
      getCommenter(
        'some/file/path.js',
        {
          webpackChunkName: false,
          webpackExclude: () => /path\/.+\.json$/
        },
        logger
      )('import("./some/test/module")', '"./some/test/module"')
    ).toBe('import(/* webpackExclude: /path\\/.+\\.json$/ */ "./some/test/module")')
  })
})
