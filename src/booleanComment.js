import { getOverrideSchema, pathIsMatch, importPrefix } from './util.js'

const defaultSchema = {
  type: 'object',
  properties: {
    active: {
      oneOf: [{ type: 'boolean' }, { instanceof: 'Function' }]
    }
  },
  additionalProperties: false
}
const getSchema = (commentSchema = defaultSchema) => ({
  oneOf: [
    { type: 'boolean' },
    { type: 'string' },
    {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    { instanceof: 'Function' },
    {
      type: 'object',
      properties: {
        config: commentSchema,
        overrides: getOverrideSchema(commentSchema)
      },
      required: ['config'],
      additionalProperties: false
    }
  ]
})
const getConfig = (
  value,
  match,
  filepath,
  importPath,
  defaultConfig = { active: true }
) => {
  const path = match === 'import' ? importPath.replace(importPrefix, '') : filepath

  if (value === true) {
    return defaultConfig
  }

  if (value === false) {
    return {
      ...defaultConfig,
      active: false
    }
  }

  if (Array.isArray(value) || typeof value === 'string') {
    return {
      ...defaultConfig,
      active: pathIsMatch(path, value)
    }
  }

  if (typeof value === 'function') {
    const configValue = value(filepath, importPath)

    if (configValue) {
      return {
        ...defaultConfig,
        active: true,
        dynamic: configValue
      }
    }

    return {
      ...defaultConfig,
      active: false
    }
  }

  let config = { ...defaultConfig, ...value.config }

  if (Array.isArray(value.overrides)) {
    const { overrides } = value
    const length = overrides.length

    for (let i = 0; i < length; i++) {
      if (pathIsMatch(path, overrides[i].files)) {
        return { ...config, ...overrides[i].config }
      }
    }
  }

  return config
}

export { getSchema, getConfig }
