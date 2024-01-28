import { getMagicComment } from 'magic-comments'
import MagicString from 'magic-string'

const format = ({
  match,
  source,
  comments,
  filepath,
  astComments,
  magicCommentOptions,
  importExpressionNodes
}) => {
  const magicImports = []
  const src = new MagicString(source)
  const getComments = node => {
    // This ignores comments that come after the imports specifier.
    return astComments.filter(
      cmt => cmt.start > node.start && cmt.end < node.end && cmt.start < node.source.end
    )
  }

  for (const node of importExpressionNodes) {
    const cmts = getComments(node)

    if (!cmts.length || comments !== 'ignore') {
      const specifier = source.substring(node.source.start, node.source.end)
      const magicComment = getMagicComment({
        match,
        modulePath: filepath,
        importPath: specifier,
        options: magicCommentOptions
      })

      if (magicComment) {
        const clone = src.snip(node.start, node.end)

        if (!cmts.length) {
          magicImports.push(
            clone.toString().replace(specifier, `${magicComment} ${specifier}`)
          )
          src.appendLeft(node.source.start, `${magicComment} `)
        } else {
          /**
           * Get the minimum start and maximum end.
           * Assumption is that comment nodes are sorted
           * in ascending order of `node.start`.
           */
          const minStart = cmts[0].start
          const maxEnd = cmts[cmts.length - 1].end

          if (comments === 'replace') {
            magicImports.push(clone.overwrite(minStart, maxEnd, magicComment).toString())
            src.overwrite(minStart, maxEnd, magicComment)
          } else if (comments === 'append') {
            magicImports.push(clone.appendRight(maxEnd, ` ${magicComment}`).toString())
            src.appendRight(maxEnd, ` ${magicComment}`)
          } else if (comments === 'prepend') {
            magicImports.push(clone.prependLeft(minStart, `${magicComment} `).toString())
            src.prependLeft(minStart, `${magicComment} `)
          } else {
            // Has to be a function or the schema validator is broken
            const replacement = comments(cmts, magicComment)

            if (typeof replacement === 'string') {
              magicImports.push(clone.overwrite(minStart, maxEnd, replacement).toString())
              src.overwrite(minStart, maxEnd, replacement)
            }
          }
        }
      }
    }
  }

  return [src.toString(), magicImports]
}

export { format }
