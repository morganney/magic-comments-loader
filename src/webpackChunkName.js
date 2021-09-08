import { parse } from 'path'

import { getOverrideConfig } from './util'

const defaultConfig = {
  active: true,
  basename: false
}
const getConfig = (value, filepath) => {
  if (value === true) {
    return defaultConfig
  }

  let config = { ...defaultConfig, ...value.config }

  if (Array.isArray(value.overrides)) {
    config = getOverrideConfig(value.overrides, filepath, config)
  }

  return config
}
const webpackChunkName = (filepath, importPath, value) => {
  const config = getConfig(value, filepath)

  if (!config.active) {
    return ''
  }

  const { basename } = config
  const { dir, name } = parse(importPath.replace(/['"`]/g, ''))
  const segments = `${dir}/${name}`.split('/').filter(segment => /\w/.test(segment))
  const chunkName = basename
    ? name
    : segments.reduce((prev, curr) => {
        /**
         * Check for dynamic expressions in imports.
         * If it exists, it has to be at least the second path
         * segment or greater, i.e. can not be the first.
         *
         * @see https://webpack.js.org/api/module-methods/#dynamic-expressions-in-import
         */
        if (/^\${/.test(curr)) {
          return prev ? `${prev}-[request]` : '[request]'
        }

        return prev ? `${prev}-${curr}` : curr
      }, '')

  return `webpackChunkName: "${chunkName}"`
}

export { webpackChunkName }
