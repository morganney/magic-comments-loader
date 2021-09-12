import micromatch from 'micromatch'

const pathIsMatch = (path, files) => {
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
    (globs.length === 0 || globs.some(glob => micromatch.isMatch(path, glob))) &&
    notglobs.every(notglob => micromatch.isMatch(path, notglob))
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
const getOverrideConfig = (overrides, filepath, config) => {
  const length = overrides.length

  for (let i = 0; i < length; i++) {
    if (pathIsMatch(filepath, overrides[i].files)) {
      return { ...config, ...overrides[i].config }
    }
  }

  return config
}
const importPrefix = /^(?:(\.{1,2}\/)+)|^\/|^.+:\/\/\/?[.-\w]+\//
const dynamicImportsWithoutComments =
  /(?<![\w.]|#!|\*[\s\w]*?|\/\/\s*|['"`][^)$]*)import\s*\((?!\s*\/\*)(?<path>\s*?['"`][^)]+['"`]\s*)\)(?!\s*?\*\/)/g

export {
  getOverrideConfig,
  getOverrideSchema,
  pathIsMatch,
  importPrefix,
  dynamicImportsWithoutComments
}
