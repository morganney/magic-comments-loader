import { commentFor } from './strategy.js'

const getCommenter = (filepath, options) => (match, capturedImportPath) => {
  const importPath = capturedImportPath.trim()
  const { verbose, ...magicCommentOptions } = options
  const magicComment = Object.keys(magicCommentOptions)
    .map(key => {
      const option = magicCommentOptions[key]

      if (option) {
        return commentFor[key](filepath, importPath, option)
      }

      return null
    })
    .filter(comment => comment)
  const magicImport = match.replace(
    capturedImportPath,
    `/* ${magicComment.join(', ')} */ ${importPath}`
  )

  if (verbose) {
    // eslint-disable-next-line no-console
    console.log('\x1b[32m%s\x1b[0m', '[MCL]', `${filepath} : ${magicImport}`)
  }

  return magicImport
}

export { getCommenter }
