import { validate } from 'schema-utils'

import { schema } from './schema.js'
import { getCommenter } from './comment.js'
import { dynamicImportsWithoutComments } from './util.js'

const loader = function (source, map, meta) {
  const options = this.getOptions()
  const optionKeys = Object.keys(options)
  const logger = this.getLogger('MCL')

  validate(schema, options, {
    name: 'magic-comments-loader'
  })

  const filepath = this.utils.contextify(this.rootContext, this.resourcePath)
  const magicComments = getCommenter(
    filepath.replace(/^\.\/?/, ''),
    optionKeys.length > 0 ? options : { match: 'module', webpackChunkName: true },
    logger
  )

  this.callback(
    null,
    source.replace(dynamicImportsWithoutComments, magicComments),
    map,
    meta
  )
}

export { loader }
