import { format } from '../src/formatter.js'

describe('format', () => {
  it('adds magic comments to import expression nodes without comments', () => {
    const openLen = 'import('.length
    const commentLen = '/* comment */'.length
    const importExpr = "import(/* comment */ './folder/module.js')"
    const src = `${importExpr};`
    const [magicSrc] = format({
      match: 'module',
      source: src,
      filepath: 'src/module.js',
      comments: 'ignore',
      astComments: [{ start: openLen, end: openLen + commentLen, text: ' comment ' }],
      magicCommentOptions: { webpackChunkName: true },
      importExpressionNodes: [
        {
          type: 'ImportExpression',
          start: 0,
          end: importExpr.length,
          source: {
            type: 'Literal',
            start: 22,
            end: 40,
            value: './folder/module.js',
            raw: "'./folder/module.js'"
          }
        }
      ]
    })

    expect(magicSrc).toEqual(expect.stringContaining(src))
  })

  it('skips comment options that return invalid values', () => {
    const importExpr = "import('./folder/module.js')"
    const src = `${importExpr};`
    const [magicSrc] = format({
      match: 'module',
      source: src,
      filepath: 'src/module.js',
      comments: 'ignore',
      astComments: [],
      magicCommentOptions: { webpackMode: () => 'invalid' },
      importExpressionNodes: [
        {
          type: 'ImportExpression',
          start: 0,
          end: importExpr.length,
          source: {
            type: 'Literal',
            start: 8,
            end: 26,
            value: './folder/module.js',
            raw: "'./folder/module.js'"
          }
        }
      ]
    })

    expect(magicSrc).toEqual(expect.stringContaining(src))
  })
})
