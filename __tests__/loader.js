import { jest } from '@jest/globals'
import logging from 'webpack/lib/logging/runtime.js'

import { loader } from '../src/loader.js'

describe('loader', () => {
  const logger = logging.getLogger('MCL')
  const getStub = (
    options = {
      webpackChunkName: true,
      webpackMode: 'lazy'
    }
  ) => ({
    utils: {
      contextify: () => './some/path.js'
    },
    getLogger: jest.fn(() => logger),
    getOptions: jest.fn(() => options)
  })

  it('modifies dynamic imports in source files', async () => {
    const stub = getStub()
    const src = 'import("src/to/file")'
    const stubInvalid = getStub({
      verbose: true,
      webpackChunkName: true,
      webpackMode: 'invalid'
    })
    const defaultStub = getStub({})
    const regexStub = getStub({ mode: 'regexp' })
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

    expect(loader.call(stub, src)).toEqual(
      expect.stringContaining(
        'import(/* webpackChunkName: "src-to-file", webpackMode: "lazy" */ "src/to/file")'
      )
    )
    expect(loader.call(stubInvalid, src)).toEqual(
      expect.stringContaining(
        'import(/* webpackChunkName: "src-to-file" */ "src/to/file")'
      )
    )
    expect(loader.call(defaultStub, multilineSrc)).toEqual(
      expect.stringContaining(multilineSrcExpected)
    )
    expect(loader.call(regexStub, src)).toEqual(
      expect.stringContaining(
        'import(/* webpackChunkName: "src-to-file" */ "src/to/file")'
      )
    )
  })
})
