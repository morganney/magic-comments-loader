import { getOverrideSchema, filepathIsMatch } from './util'

const defaultSchema = {
  type: 'object',
  properties: {
    active: {
      type: 'boolean'
    }
  },
  additionalProperties: false
}
const getSchema = (commentSchema = defaultSchema) => ({
  anyOf: [
    { type: 'boolean' },
    { type: 'string' },
    {
      type: 'array',
      items: {
        type: 'string'
      }
    },
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
const getConfig = (value, filepath, defaultConfig = { active: true }) => {
  if (value === true) {
    return defaultConfig
  }

  if (Array.isArray(value) || typeof value === 'string') {
    return {
      ...defaultConfig,
      active: filepathIsMatch(filepath, value)
    }
  }

  let config = { ...defaultConfig, ...value.config }

  if (Array.isArray(value.overrides)) {
    const { overrides } = value
    const length = overrides.length

    for (let i = 0; i < length; i++) {
      if (filepathIsMatch(filepath, overrides[i].files)) {
        return { ...config, ...overrides[i].config }
      }
    }
  }

  return config
}

export { getSchema, getConfig }
