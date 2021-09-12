import { parse } from 'path'

import { getSchema, getConfig } from './booleanComment.js'

const schema = getSchema({
  type: 'object',
  properties: {
    active: {
      oneOf: [{ type: 'boolean' }, { instanceof: 'Function' }]
    },
    basename: {
      type: 'boolean'
    }
  },
  additionalProperties: false
})
const webpackChunkName = (filepath, importPath, value, match) => {
  const config = getConfig(value, match, filepath, importPath, {
    active: true,
    basename: false
  })
  const isActive =
    typeof config.active === 'function'
      ? config.active(filepath, importPath)
      : config.active

  if (!isActive) {
    return ''
  }

  if (typeof config.dynamic === 'string') {
    return `webpackChunkName: "${config.dynamic}"`
  }

  const { basename } = config
  const { dir, name } = parse(importPath)
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

export { webpackChunkName, schema }
