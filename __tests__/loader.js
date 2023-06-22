import { jest } from '@jest/globals'

import { loader } from '../src/loader.js'

describe('loader', () => {
  const getStub = (
    options = {
      webpackChunkName: true,
      webpackMode: 'lazy'
    }
  ) => ({
    utils: {
      contextify: () => './some/path.js'
    },
    getLogger: jest.fn(),
    callback: jest.fn((err, commentedSrc) => {
      return commentedSrc
    }),
    getOptions: jest.fn(() => options)
  })

  it('modifies dynamic imports in source files', async () => {
    const stub = getStub()
    const src = 'import("src/to/file")'
    const stubInvalid = getStub({
      webpackChunkName: true,
      webpackMode: 'invalid'
    })
    const defaultStub = getStub({})
    const multilineSrc = `
      reg([
        { module: import('@pkg/button'), elem: 'Button' },
        { module: import('@pkg/collapse'), elem: 'Collapse' },
        { module: import('@pkg/icon'), elem: 'Icon' },
      ]);
    `
    const multilineSrcExpected = `
      reg([
        { module: import(/* webpackChunkName: "@pkg-button" */ '@pkg/button'), elem: 'Button' },
        { module: import(/* webpackChunkName: "@pkg-collapse" */ '@pkg/collapse'), elem: 'Collapse' },
        { module: import(/* webpackChunkName: "@pkg-icon" */ '@pkg/icon'), elem: 'Icon' },
      ]);
    `

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
    loader.call(defaultStub, multilineSrc)
    expect(defaultStub.callback).toHaveBeenCalledWith(
      null,
      multilineSrcExpected,
      undefined,
      undefined
    )
  })
})
