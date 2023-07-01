import { getMagicComment } from 'magic-comments'

const getCommenter = (filepath, options, logger) => (rgxMatch, capturedImportPath) => {
  const importPath = capturedImportPath.trim()
  const { verbose, match, magicCommentOptions } = options
  const magicComment = getMagicComment({
    match,
    importPath,
    modulePath: filepath,
    options: magicCommentOptions
  })
  const magicImport = rgxMatch.replace(
    capturedImportPath,
    magicComment.length > 0 ? `${magicComment} ${importPath}` : importPath
  )

  if (verbose) {
    logger.info(`${filepath} : ${magicImport}`)
  }

  return magicImport
}

export { getCommenter }
