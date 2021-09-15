import { getOverrideConfig, getOverrideSchema } from './util'

const getRegexComment = type => {
  const configSchema = {
    type: 'object',
    properties: {
      active: {
        oneOf: [{ type: 'boolean' }, { instanceof: 'Function' }]
      },
      include: {
        oneOf: [{ instanceof: 'Function' }, { instanceof: 'RegExp' }]
      }
    },
    required: [type],
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
  const getConfig = (value, filepath) => {
    if (typeof value === 'function') {
      return {
        active: true,
        [type]: value
      }
    }

    let config = { active: true, ...value.config }

    if (Array.isArray(value.overrides)) {
      config = getOverrideConfig(value.overrides, filepath, config)
    }

    return config
  }
  const comment = (filepath, importPath, value) => {
    const config = getConfig(value, filepath)
    const isActive =
      typeof config.active === 'function'
        ? config.active(filepath, importPath)
        : config.active
    let regex = null

    if (!isActive) {
      return ''
    }

    if (typeof config[type] === 'function') {
      regex = config[type](filepath, importPath)
    }

    if (config[type] instanceof RegExp) {
      regex = config[type]
    }

    if (!(regex instanceof RegExp)) {
      return ''
    }

    const source = regex.source
    const typeName = `${type[0].toUpperCase()}${type.slice(1)}`
    /**
     * Check if the provided RegExp ends in one or more '*'
     * and if so be sure to escape the ending '/' in the
     * comments regular expression so as not to break the
     * comment and cause a SyntaxError.
     */
    if (/(\*+)$/.test(source)) {
      return `webpack${typeName}: /${source}\\/${regex.flags}`
    }

    return `webpack${typeName}: /${source}/${regex.flags}`
  }

  return { comment, schema }
}

export { getRegexComment }
