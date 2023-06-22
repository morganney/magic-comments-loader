import { getOverrideConfig, getOverrideSchema } from './util.js'

const getEnumComment = (name, enums, defaultValue) => {
  const configSchema = {
    type: 'object',
    properties: {
      active: {
        oneOf: [{ type: 'boolean' }, { instanceof: 'Function' }]
      },
      [name]: {
        oneOf: [{ enum: enums }, { instanceof: 'Function' }]
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
    [name]: defaultValue
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

    if (typeof value === 'string' || typeof value === 'function') {
      return {
        ...defaultConfig,
        [name]: value
      }
    }

    let config = { ...defaultConfig, ...value.config }

    if (Array.isArray(value.overrides)) {
      config = getOverrideConfig(value.overrides, filepath, config)
    }

    return config
  }
  const comment = (filepath, importPath, value) => {
    let enumValue = ''
    const commentSuffix = `${name[0].toUpperCase()}${name.slice(1)}`
    const config = getConfig(value, filepath)
    const isActive =
      typeof config.active === 'function'
        ? config.active(filepath, importPath)
        : config.active

    if (!isActive) {
      return ''
    }

    if (typeof config[name] === 'function') {
      enumValue = config[name](filepath, importPath)
    }

    if (typeof config[name] === 'string') {
      enumValue = config[name]
    }

    if (!enums.includes(enumValue)) {
      return ''
    }

    return `webpack${commentSuffix}: "${enumValue}"`
  }

  return { comment, schema }
}

export { getEnumComment }
