import { getOverrideConfig, getOverrideSchema } from './util'

const validModes = ['lazy', 'lazy-once', 'eager', 'weak']
const configSchema = {
  type: 'object',
  properties: {
    active: {
      oneOf: [{ type: 'boolean' }, { instanceof: 'Function' }]
    },
    mode: {
      oneOf: [{ enum: validModes }, { instanceof: 'Function' }]
    }
  },
  additionalProperties: false
}
const schema = {
  oneOf: [
    { type: 'boolean' },
    { type: 'string' },
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
  active: true,
  mode: 'lazy'
}
const getConfig = (value, filepath) => {
  if (value === true) {
    return defaultConfig
  }

  if (value === false) {
    return {
      ...defaultConfig,
      active: false
    }
  }

  if (typeof value === 'string') {
    return {
      ...defaultConfig,
      mode: value,
      active: validModes.includes(value)
    }
  }

  if (typeof value === 'function') {
    return {
      ...defaultConfig,
      mode: value
    }
  }

  let config = { ...defaultConfig, ...value.config }

  if (Array.isArray(value.overrides)) {
    config = getOverrideConfig(value.overrides, filepath, config)
  }

  return config
}
const webpackMode = (filepath, importPath, value) => {
  let mode = ''
  const config = getConfig(value, filepath)
  const isActive =
    typeof config.active === 'function'
      ? config.active(filepath, importPath)
      : config.active

  if (!isActive) {
    return ''
  }

  if (typeof config.mode === 'function') {
    mode = config.mode(filepath, importPath)
  }

  if (typeof config.mode === 'string') {
    mode = config.mode
  }

  if (!validModes.includes(mode)) {
    return ''
  }

  return `webpackMode: "${mode}"`
}

export { webpackMode, schema }
