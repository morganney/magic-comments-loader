import { commentFor } from '../src/strategy.js'

describe('commentFor', () => {
  it('is an object with functions', () => {
    expect(commentFor).toStrictEqual(
      expect.objectContaining({
        webpackChunkName: expect.any(Function),
        webpackMode: expect.any(Function),
        webpackIgnore: expect.any(Function)
      })
    )
  })
})
