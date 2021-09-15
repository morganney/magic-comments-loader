import { commentFor } from '../src/strategy.js'

describe('commentFor', () => {
  it('is an object with functions', () => {
    expect(commentFor).toStrictEqual(
      expect.objectContaining({
        webpackChunkName: expect.any(Function),
        webpackMode: expect.any(Function),
        webpackIgnore: expect.any(Function),
        webpackPreload: expect.any(Function),
        webpackPrefetch: expect.any(Function),
        webpackExports: expect.any(Function),
        webpackInclude: expect.any(Function),
        webpackExclude: expect.any(Function)
      })
    )
  })
})
