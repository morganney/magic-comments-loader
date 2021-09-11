import { getOverrideConfig, getOverrideSchema } from './util'

const validModes = ['lazy', 'lazy-once', 'eager', 'weak']
const configSchema = {
  type: 'object',
  properties: {
    active: {
      type: 'boolean'
    },
    mode: {
      enum: validModes
    }
  },
  additionalProperties: false
}
const schema = {
  anyOf: [
    { type: 'boolean' },
    {
      type: 'object',
      properties: {
        config: configSchema,
        overrides: getOverrideSchema(configSchema.properties)
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
  if (typeof value === 'string') {
    return {
      ...defaultConfig,
      mode: value,
      active: validModes.includes(value)
    }
  }

  let config = { ...defaultConfig, ...value.config }

  if (Array.isArray(value.overrides)) {
    config = getOverrideConfig(value.overrides, filepath, config)
  }

  return config
}
const webpackMode = (filepath, importPath, value) => {
  const config = getConfig(value, filepath)

  if (!config.active) {
    return ''
  }

  return `webpackMode: "${config.mode}"`
}

export { webpackMode, schema }
