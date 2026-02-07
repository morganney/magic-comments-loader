import rspack from '@rspack/core'

globalThis.__MCL_BUNDLER__ = rspack
globalThis.__MCL_BUNDLER_NAME__ = 'rspack'

await import('./loader.spec.js')
