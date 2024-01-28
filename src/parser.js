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
  const astComments = []
  const importExpressionNodes = []
  const ast = jsxParser.parse(source, {
    locations: false,
    ecmaVersion: 2023,
    sourceType: 'module',
    allowAwaitOutsideFunction: true,
    allowReturnOutsideFunction: true,
    allowImportExportEverywhere: true,
    onComment: (isBlock, text, start, end) => {
      if (isBlock) {
        astComments.push({ start, end, text })
      }
    }
  })

  simple(ast, {
    ImportExpression(node) {
      importExpressionNodes.push(node)
    }
  })

  return { ast, astComments, importExpressionNodes, source }
}

export { parse }
