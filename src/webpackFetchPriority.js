import { getEnumComment } from './enumComment.js'

const { comment: webpackFetchPriority, schema } = getEnumComment(
  'fetchPriority',
  ['high', 'low', 'auto'],
  'auto'
)

export { webpackFetchPriority, schema }
