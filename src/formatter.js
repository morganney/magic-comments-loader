import { getMagicComment } from 'magic-comments'
import MagicString from 'magic-string'

const format = ({
  match,
  source,
  filepath,
  comments,
  magicCommentOptions,
  importExpressionNodes
}) => {
  const magicImports = []
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
      const specifier = source.substring(node.source.start, node.source.end)
      const magicComment = getMagicComment({
        match,
        modulePath: filepath,
        importPath: specifier,
        options: magicCommentOptions
      })

      if (magicComment) {
        magicImports.push(
          src
            .snip(node.start, node.end)
            .toString()
            .replace(specifier, `${magicComment} ${specifier}`)
        )
        src.appendLeft(node.source.start, `${magicComment} `)
      }
    }
  }

  return [src.toString(), magicImports]
}

export { format }
