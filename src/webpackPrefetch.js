import { getSchema, getConfig } from './booleanComment.js'

const schema = getSchema()
const webpackPrefetch = (filepath, importPath, value) => {
  const config = getConfig(value, filepath)

  if (!config.active) {
    return ''
  }

  return 'webpackPrefetch: true'
}

export { webpackPrefetch, schema }
