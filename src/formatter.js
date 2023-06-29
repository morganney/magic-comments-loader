import MagicString from 'magic-string'

import { commentFor } from './strategy.js'
import { getBareImportSpecifier } from './util.js'

const format = ({
  match,
  source,
  filepath,
  comments,
  magicCommentOptions,
  importExpressionNodes
}) => {
  const magicImports = []
  const step = 'import('.length
  const cmts = [...comments]
  const src = new MagicString(source)
  const hasComment = node => {
    const idx = cmts.findIndex(cmt => cmt.start > node.start && cmt.end < node.end)
    const wasFound = idx > -1

    if (wasFound) {
      cmts.splice(idx, 1)
    }

    return wasFound
  }

  for (const node of importExpressionNodes) {
    if (!hasComment(node)) {
      const specifier = source.substring(node.start + step, node.end - 1)
      const bareImportPath = getBareImportSpecifier(specifier)
      const magic = Object.keys(magicCommentOptions)
        .map(key =>
          commentFor[key](filepath, bareImportPath, magicCommentOptions[key], match)
        )
        .filter(Boolean)

      if (magic.length) {
        const magicComment = `/* ${magic.join(', ')} */ `

        magicImports.push(
          src
            .snip(node.start, node.end)
            .toString()
            .replace(specifier, `${magicComment}${specifier}`)
        )
        src.appendRight(node.start + step, `${magicComment}`)
      }
    }
  }

  return [src.toString(), magicImports]
}

export { format }
