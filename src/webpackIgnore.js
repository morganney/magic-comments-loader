import { getSchema, getConfig } from './booleanComment.js'

const schema = getSchema()
const webpackIgnore = (filepath, importPath, value) => {
  const config = getConfig(value, filepath)

  if (!config.active) {
    return ''
  }

  return 'webpackIgnore: true'
}

export { webpackIgnore, schema }
