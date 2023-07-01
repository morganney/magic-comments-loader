import { schema as magicSchema } from 'magic-comments'

const schema = {
  type: 'object',
  properties: {
    ...magicSchema.properties,
    mode: {
      enum: ['parser', 'regexp']
    }
  },
  additionalProperties: false
}

export { schema }
