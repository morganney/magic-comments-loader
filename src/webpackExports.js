import { getOverrideConfig, getOverrideSchema } from './util.js'

const configSchema = {
  type: 'object',
  properties: {
    active: {
      oneOf: [{ type: 'boolean' }, { instanceof: 'Function' }]
    },
    exports: {
      instanceof: 'Function'
    }
  },
  additionalProperties: false
}
const schema = {
  oneOf: [
    { instanceof: 'Function' },
    {
      type: 'object',
      properties: {
        config: configSchema,
        overrides: getOverrideSchema(configSchema)
      },
      required: ['config'],
      additionalProperties: false
    }
  ]
}
const defaultConfig = {
  active: true
}
const getConfig = (value, filepath) => {
  if (typeof value === 'function') {
    return {
      ...defaultConfig,
      exports: value
    }
  }

  let config = { ...defaultConfig, ...value.config }

  if (Array.isArray(value.overrides)) {
    config = getOverrideConfig(value.overrides, filepath, config)
  }

  return config
}
const webpackExports = (filepath, importPath, value) => {
  let exports = ''
  let configExports = []
  const config = getConfig(value, filepath)
  const isActive =
    typeof config.active === 'function'
      ? config.active(filepath, importPath)
      : config.active

  if (!isActive || typeof config.exports !== 'function') {
    return ''
  }

  configExports = config.exports(filepath, importPath)

  if (!Array.isArray(configExports)) {
    return ''
  }

  exports = `["${configExports.reduce((curr, next) => `${curr}", "${next}`)}"]`

  return `webpackExports: ${exports}`
}

export { webpackExports, schema }
