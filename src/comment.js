import { commentFor } from './strategy.js'

const getCommenter = (filepath, options) => (rgxMatch, capturedImportPath) => {
  const importPath = capturedImportPath.trim()
  const bareImportPath = importPath.replace(/['"`]/g, '')
  const { verbose, match, ...magicCommentOptions } = options
  const magicComment = Object.keys(magicCommentOptions)
    .map(key => {
      const option = magicCommentOptions[key]

      if (option) {
        return commentFor[key](filepath, bareImportPath, option, match)
      }

      return null
    })
    .filter(comment => comment)
  const magicImport = rgxMatch.replace(
    capturedImportPath,
    magicComment.length > 0
      ? `/* ${magicComment.join(', ')} */ ${importPath}`
      : `${importPath}`
  )

  if (verbose) {
    // eslint-disable-next-line no-console
    console.log('\x1b[32m%s\x1b[0m', '[MCL]', `${filepath} : ${magicImport}`)
  }

  return magicImport
}

export { getCommenter }
