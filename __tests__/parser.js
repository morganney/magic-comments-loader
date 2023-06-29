import { parse } from '../src/parser.js'

describe('parse', () => {
  it('parses 2023 ecmascript and jsx while tracking block comments', () => {
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
    const { comments } = parse(src)

    expect(comments).toEqual([{ start: 175, end: 188, commentText: ' comment ' }])
  })
})
