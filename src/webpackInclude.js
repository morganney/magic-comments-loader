import { getRegexComment } from './regexComment.js'

const { comment: webpackInclude, schema } = getRegexComment('include')

export { webpackInclude, schema }
