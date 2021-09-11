import { getSchema, getConfig } from './booleanComment.js'

const schema = getSchema()
const webpackPreload = (filepath, importPath, value) => {
  const config = getConfig(value, filepath)

  if (!config.active) {
    return ''
  }

  return 'webpackPreload: true'
}

export { webpackPreload, schema }
