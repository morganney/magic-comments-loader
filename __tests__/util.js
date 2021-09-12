import {
  pathIsMatch,
  getOverrideConfig,
  dynamicImportsWithoutComments
} from '../src/util.js'

describe('dynamicImportsWithoutComments', () => {
  it('is a regex to match dyanmic imports', () => {
    expect(
      `const str = 'import("some/path")'`.replace(dynamicImportsWithoutComments, 'test')
    ).toEqual(`const str = 'import("some/path")'`)
    expect('import("some/path")'.replace(dynamicImportsWithoutComments, 'test')).toEqual(
      'test'
    )
    expect(
      `import(
      "some/path"
    )`.replace(dynamicImportsWithoutComments, 'test')
    ).toEqual('test')
    expect(
      `import(/* with comments */ "some/path")`.replace(
        dynamicImportsWithoutComments,
        'test'
      )
    ).toEqual(`import(/* with comments */ "some/path")`)
    expect(
      `console.log('import("some/path")')`.replace(dynamicImportsWithoutComments, 'test')
    ).toEqual(`console.log('import("some/path")')`)
  })
})

describe('pathIsMatch', () => {
  it('compares a filepath to glob patterns', () => {
    expect(pathIsMatch('some/file/path.js', 'some/**/*.js')).toEqual(true)
    expect(pathIsMatch('some/file/path', ['some/**/*.js', '!some/file/*.js'])).toEqual(
      false
    )
    expect(pathIsMatch('some/file/path.js', ['some/**/*.js', '!some/miss/*.js'])).toEqual(
      true
    )
  })
})

describe('getOverrideConfig', () => {
  const overrides = [
    {
      files: 'some/**/*.js',
      config: {
        test: true
      }
    }
  ]

  it('gets config overrides based on path globs', () => {
    expect(
      getOverrideConfig(overrides, 'some/file/path.js', { test: false })
    ).toStrictEqual({
      test: true
    })
  })

  it('returns the passed config if filepath is not a match', () => {
    const config = { test: 'it' }

    expect(getOverrideConfig(overrides, 'miss/file/path.js', config)).toBe(config)
  })
})
