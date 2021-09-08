import { getOverrideConfig, filepathIsMatch } from './util'

const defaultConfig = {
  active: true
}
const getConfig = (value, filepath) => {
  if (Array.isArray(value) || typeof value === 'string') {
    return {
      ...defaultConfig,
      active: filepathIsMatch(filepath, value)
    }
  }

  let config = { ...defaultConfig, ...value.config }

  if (Array.isArray(value.overrides)) {
    config = getOverrideConfig(value.overrides, filepath, config)
  }

  return config
}
const webpackIgnore = (filepath, importPath, value) => {
  const config = getConfig(value, filepath)

  if (!config.active) {
    return ''
  }

  return `webpackIgnore: ${config.active}`
}

export { webpackIgnore }
