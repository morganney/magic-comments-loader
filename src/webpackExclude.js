import { getRegexComment } from './regexComment.js'

const { comment: webpackExclude, schema } = getRegexComment('exclude')

export { webpackExclude, schema }
