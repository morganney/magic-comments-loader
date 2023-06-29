import { commentFor } from './strategy.js'
import { getBareImportSpecifier } from './util.js'

const getCommenter = (filepath, options, logger) => (rgxMatch, capturedImportPath) => {
  const importPath = capturedImportPath.trim()
  const bareImportPath = getBareImportSpecifier(importPath)
  const { verbose, match, magicCommentOptions } = options
  const magicComment = Object.keys(magicCommentOptions)
    .map(key =>
      commentFor[key](filepath, bareImportPath, magicCommentOptions[key], match)
    )
    .filter(Boolean)
  const magicImport = rgxMatch.replace(
    capturedImportPath,
    magicComment.length > 0
      ? `/* ${magicComment.join(', ')} */ ${importPath}`
      : importPath
  )

  if (verbose) {
    logger.info(`${filepath} : ${magicImport}`)
  }

  return magicImport
}

export { getCommenter }
