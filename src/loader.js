import { getOptions } from 'loader-utils'
import { validate } from 'schema-utils'

import { schema } from './schema.js'
import { getCommenter } from './comment.js'

const dynamicImportsWithoutComments =
  /(?<!\w|\*[\s\w]*?|\/\/\s*)import\s*\((?!\s*\/\*)(?<path>\s*?['"`].+['"`]\s*)\)/g
const loader = function (source, map, meta) {
  const options = getOptions(this)
  const optionKeys = Object.keys(options)

  validate(schema, options, {
    name: 'magic-comments-loader'
  })

  const filepath = this.utils.contextify(this.rootContext, this.resourcePath)
  const magicComments = getCommenter(
    filepath.replace(/^\.\/?/, ''),
    optionKeys.length > 0 ? options : { match: 'module', webpackChunkName: true }
  )

  this.callback(
    null,
    source.replace(dynamicImportsWithoutComments, magicComments),
    map,
    meta
  )
}

export { loader }
