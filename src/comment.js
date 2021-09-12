import { commentFor } from './strategy.js'

const getCommenter =
  (filepath, options, logger = console) =>
  (rgxMatch, capturedImportPath) => {
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
      logger.info('[MCL]', `${filepath} : ${magicImport}`)
    }

    return magicImport
  }

export { getCommenter }
