import micromatch from 'micromatch'

const getOverrideConfig = (overrides, filepath, config) => {
  const length = overrides.length

  for (let i = 0; i < length; i++) {
    if (filepathIsMatch(filepath, overrides[i].files)) {
      return { ...config, ...overrides[i].config }
    }
  }

  return config
}

const filepathIsMatch = (filepath, files) => {
  const globs = []
  const notglobs = []

  if (!Array.isArray(files)) {
    files = [files]
  }

  files.forEach(file => {
    if (/^!/.test(file)) {
      notglobs.push(file)
    } else {
      globs.push(file)
    }
  })

  return (
    (globs.length === 0 || globs.some(glob => micromatch.isMatch(filepath, glob))) &&
    notglobs.every(notglob => micromatch.isMatch(filepath, notglob))
  )
}

const getOverrideSchema = commentSchema => ({
  type: 'array',
  items: {
    type: 'object',
    properties: {
      config: commentSchema,
      files: {
        oneOf: [
          {
            type: 'string'
          },
          {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        ]
      }
    },
    additionalProperties: false
  }
})

export { getOverrideConfig, getOverrideSchema, filepathIsMatch }
