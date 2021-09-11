import { filepathIsMatch, getOverrideConfig } from '../src/util.js'

describe('filepathIsMatch', () => {
  it('compares a filepath to glob patterns', () => {
    expect(filepathIsMatch('some/file/path.js', 'some/**/*.js')).toEqual(true)
    expect(
      filepathIsMatch('some/file/path', ['some/**/*.js', '!some/file/*.js'])
    ).toEqual(false)
    expect(
      filepathIsMatch('some/file/path.js', ['some/**/*.js', '!some/miss/*.js'])
    ).toEqual(true)
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
