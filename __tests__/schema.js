import { schema } from '../src/schema.js'

describe('schema', () => {
  it('is a json-schema object', () => {
    expect(schema).toStrictEqual(
      expect.objectContaining({
        type: expect.stringMatching('object'),
        properties: expect.any(Object),
        additionalProperties: expect.any(Boolean)
      })
    )
  })
})
