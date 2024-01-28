import { schema as magicSchema } from 'magic-comments'

const schema = {
  type: 'object',
  properties: {
    ...magicSchema.properties,
    mode: {
      enum: ['parser', 'regexp']
    },
    comments: {
      /**
       * How to apply magic comments when the dynamic import already includes a block-level comment.
       *
       * - ignore: Default. Skip adding magic comments.
       * - replace: Replace the found comment with any applied magic commments.
       * - append: Add any applied magic comments after the comment.
       * - preprend: Add any applied magic comments before the comment.
       * - Function: (cmts: {}[], magicComment: string) => string
       */
      oneOf: [
        { enum: ['ignore', 'replace', 'prepend', 'append'] },
        { instanceof: 'Function' }
      ]
    }
  },
  additionalProperties: false
}

export { schema }
