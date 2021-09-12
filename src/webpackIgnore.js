import { getSchema, getConfig } from './booleanComment.js'

const schema = getSchema()
const webpackIgnore = (filepath, importPath, value, match) => {
  const config = getConfig(value, match, filepath, importPath)
  const isActive =
    typeof config.active === 'function'
      ? config.active(filepath, importPath)
      : config.active

  if (!isActive) {
    return ''
  }

  return 'webpackIgnore: true'
}

export { webpackIgnore, schema }
