import { jest } from '@jest/globals'

const loadParser = async parseSyncMock => {
  jest.resetModules()
  if (parseSyncMock) {
    jest.unstable_mockModule('oxc-parser', () => ({ parseSync: parseSyncMock }))
  }
  return import('../src/parser.js')
}

describe('parse', () => {
  it('parses 2023 ecmascript and jsx while tracking block comments', async () => {
    const src = `
    // inline comment
    const Component = () => {
      return (
        <>
          <LazyRoute
            path="/skip"
            component={() =>
              import(/* comment */ './folder/skip')}
          />
          <LazyRoute
            path="/clusters"
            component={() =>
              import(
                './containers/clusters/ClusterRoutes'
              )}
          />
        </>
      )
    }
    `
    const { parse } = await loadParser()
    const { astComments } = parse(src)

    expect(astComments).toEqual([{ start: 175, end: 188, text: ' comment ' }])
  })

  it('throws on parser errors', async () => {
    const parseSync = jest.fn().mockReturnValue({
      program: { type: 'Program', body: [] },
      comments: [],
      errors: [{ message: 'boom' }]
    })
    const { parse } = await loadParser(parseSync)

    expect(() => parse('bad')).toThrow('[oxc-parser] boom')
  })

  it('uses a generic message when error text is missing', async () => {
    const parseSync = jest.fn().mockReturnValue({
      program: { type: 'Program', body: [] },
      comments: [],
      errors: [{ message: 123 }]
    })
    const { parse } = await loadParser(parseSync)

    expect(() => parse('bad')).toThrow('[oxc-parser] Parse error')
  })

  it('handles non-node programs', async () => {
    const parseSync = jest.fn().mockReturnValue({
      program: null,
      comments: [],
      errors: []
    })
    const { parse } = await loadParser(parseSync)
    const result = parse('')

    expect(result.importExpressionNodes).toEqual([])
  })

  it('normalizes span-based import expressions', async () => {
    const parseSync = jest.fn().mockReturnValue({
      program: {
        type: 'Program',
        body: [
          {
            type: 'ImportExpression',
            span: { start: 1, end: 9 },
            source: {
              type: 'StringLiteral',
              span: { start: 4, end: 8 }
            }
          }
        ]
      },
      comments: [],
      errors: []
    })
    const { parse } = await loadParser(parseSync)
    const result = parse('import("./x")')

    expect(result.importExpressionNodes).toEqual([
      expect.objectContaining({
        start: 1,
        end: 9,
        source: expect.objectContaining({ start: 4, end: 8 })
      })
    ])
  })

  it('handles non-object sources and missing spans', async () => {
    const parseSync = jest.fn().mockReturnValue({
      program: {
        type: 'Program',
        body: [
          {
            type: 'ImportExpression',
            span: { start: 1, end: 9 },
            source: 123
          }
        ]
      },
      comments: [],
      errors: []
    })
    const { parse } = await loadParser(parseSync)
    const result = parse('import("./x")')

    expect(result.importExpressionNodes).toEqual([])
  })

  it('adds start/end from spans when missing', async () => {
    const parseSync = jest.fn().mockReturnValue({
      program: {
        type: 'Program',
        body: [
          {
            type: 'ImportExpression',
            span: { start: 10, end: 30 },
            source: {
              type: 'StringLiteral',
              span: { start: 18, end: 28 }
            }
          }
        ]
      },
      comments: [],
      errors: []
    })
    const { parse } = await loadParser(parseSync)
    const result = parse('import("./x")')

    expect(result.importExpressionNodes[0]).toEqual(
      expect.objectContaining({
        start: 10,
        end: 30,
        source: expect.objectContaining({ start: 18, end: 28 })
      })
    )
  })

  it('skips import expressions without source spans', async () => {
    const parseSync = jest.fn().mockReturnValue({
      program: {
        type: 'Program',
        body: [
          {
            type: 'ImportExpression',
            span: { start: 1, end: 9 },
            source: null
          }
        ]
      },
      comments: [],
      errors: []
    })
    const { parse } = await loadParser(parseSync)
    const result = parse('import("./x")')

    expect(result.importExpressionNodes).toEqual([])
  })

  it('filters non-block comments', async () => {
    const parseSync = jest.fn().mockReturnValue({
      program: { type: 'Program', body: [] },
      comments: [{ type: 'Line', start: 1, end: 3, value: 'line' }],
      errors: []
    })
    const { parse } = await loadParser(parseSync)
    const result = parse('// comment')

    expect(result.astComments).toEqual([])
  })

  it('reads block comment fields from kind/span/text', async () => {
    const parseSync = jest.fn().mockReturnValue({
      program: { type: 'Program', body: [] },
      comments: [
        {
          kind: 'Block',
          span: { start: 5, end: 9 },
          text: ' block '
        }
      ],
      errors: []
    })
    const { parse } = await loadParser(parseSync)
    const result = parse('/* block */')

    expect(result.astComments).toEqual([{ start: 5, end: 9, text: ' block ' }])
  })

  it('falls back to comment content when text is missing', async () => {
    const parseSync = jest.fn().mockReturnValue({
      program: { type: 'Program', body: [] },
      comments: [
        {
          type: 'Block',
          start: 2,
          end: 6,
          content: ' content '
        }
      ],
      errors: []
    })
    const { parse } = await loadParser(parseSync)
    const result = parse('/* content */')

    expect(result.astComments).toEqual([{ start: 2, end: 6, text: ' content ' }])
  })

  it('uses comment value when present', async () => {
    const parseSync = jest.fn().mockReturnValue({
      program: { type: 'Program', body: [] },
      comments: [
        {
          type: 'Block',
          start: 3,
          end: 7,
          value: ' value '
        }
      ],
      errors: []
    })
    const { parse } = await loadParser(parseSync)
    const result = parse('/* value */')

    expect(result.astComments).toEqual([{ start: 3, end: 7, text: ' value ' }])
  })

  it('defaults to empty comment text when fields are missing', async () => {
    const parseSync = jest.fn().mockReturnValue({
      program: { type: 'Program', body: [] },
      comments: [
        {
          type: 'Block',
          start: 1,
          end: 2
        }
      ],
      errors: []
    })
    const { parse } = await loadParser(parseSync)
    const result = parse('/* */')

    expect(result.astComments).toEqual([{ start: 1, end: 2, text: '' }])
  })
})
