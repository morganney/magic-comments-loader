import micromatch from 'micromatch'

const getOverrideConfig = (overrides, filepath, config) => {
  const length = overrides.length

  for (let i = 0; i < length; i++) {
    let { files } = overrides[i]
    let globs = []
    let notglobs = []

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

    if (
      (globs.length === 0 || globs.some(glob => micromatch.isMatch(filepath, glob))) &&
      notglobs.every(notglob => micromatch.isMatch(filepath, notglob))
    ) {
      return { ...config, ...overrides[i].config }
    }
  }

  return config
}

export { getOverrideConfig }
