import { getEnumComment } from './enumComment.js'

const { comment: webpackMode, schema } = getEnumComment(
  'mode',
  ['lazy', 'lazy-once', 'eager', 'weak'],
  'lazy'
)

export { webpackMode, schema }
