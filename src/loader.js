import { validate } from 'schema-utils'

import { schema } from './schema.js'
import { parse } from './parser.js'
import { format } from './formatter.js'
import { getCommenter } from './comment.js'
import { dynamicImportsWithoutComments } from './util.js'

const loader = function (source) {
  const options = this.getOptions()
  const logger = this.getLogger('MCL')

  validate(schema, options, {
    name: 'magic-comments-loader'
  })

  const { mode = 'parser', match = 'module', verbose = false, ...rest } = options
  const magicCommentOptions = Object.keys(rest).length ? rest : { webpackChunkName: true }
  const filepath = this.utils
    .contextify(this.rootContext, this.resourcePath)
    .replace(/^\.\/?/, '')

  if (mode === 'parser') {
    const [magicSource, magicImports] = format({
      ...parse(source),
      match,
      filepath,
      magicCommentOptions
    })

    if (verbose) {
      magicImports.forEach(magicImport => {
        logger.info(`${filepath} : ${magicImport}`)
      })
    }

    return magicSource
  }

  return source.replace(
    dynamicImportsWithoutComments,
    getCommenter(filepath, { verbose, match, magicCommentOptions }, logger)
  )
}

export { loader }
