import { jest } from '@jest/globals'

import { loader } from '../src/loader.js'

describe('loader', () => {
  const getStub = (options = {}) => ({
    utils: {
      contextify: () => './some/path.js'
    },
    getLogger: jest.fn(),
    callback: jest.fn((err, commentedSrc) => {
      return commentedSrc
    }),
    query: {
      webpackChunkName: true,
      webpackMode: 'lazy'
    },
    ...options
  })

  it('modifies dynamic imports in source files', async () => {
    const stub = getStub()
    const src = 'import("src/to/file")'
    const stubInvalid = getStub({
      query: {
        webpackChunkName: true,
        webpackMode: 'invalid'
      }
    })
    const defaultStub = getStub({
      query: {}
    })

    loader.call(stub, src)
    expect(stub.callback).toHaveBeenCalledWith(
      null,
      'import(/* webpackChunkName: "src-to-file", webpackMode: "lazy" */ "src/to/file")',
      undefined,
      undefined
    )
    loader.call(stubInvalid, src)
    expect(stubInvalid.callback).toHaveBeenCalledWith(
      null,
      'import(/* webpackChunkName: "src-to-file" */ "src/to/file")',
      undefined,
      undefined
    )
    loader.call(defaultStub, src)
    expect(defaultStub.callback).toHaveBeenCalledWith(
      null,
      'import(/* webpackChunkName: "src-to-file" */ "src/to/file")',
      undefined,
      undefined
    )
  })
})
