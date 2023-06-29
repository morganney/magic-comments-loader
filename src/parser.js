import { Parser } from 'acorn'
import { simple, base } from 'acorn-walk'
import { extend } from 'acorn-jsx-walk'
import jsx from 'acorn-jsx'

/**
 * NOTE: Side-effect of importing this module's exports.
 *
 * Extend acorn-walk's base with missing JSX nodes.
 * @see https://github.com/acornjs/acorn/issues/829
 *
 * Consider another parser that supports more syntaxes out-of-the-box.
 * That would enable less requirements on loader chaining.
 */
extend(base)

const jsxParser = Parser.extend(jsx())
const parse = source => {
  const comments = []
  const importExpressionNodes = []
  const ast = jsxParser.parse(source, {
    locations: false,
    ecmaVersion: 2023,
    sourceType: 'module',
    allowAwaitOutsideFunction: true,
    allowReturnOutsideFunction: true,
    allowImportExportEverywhere: true,
    onComment: (isBlock, commentText, start, end) => {
      if (isBlock) {
        comments.push({ start, end, commentText })
      }
    }
  })

  simple(ast, {
    ImportExpression(node) {
      importExpressionNodes.push(node)
    }
  })

  return { ast, comments, importExpressionNodes, source }
}

export { parse }
