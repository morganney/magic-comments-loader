import { relative } from 'node:path'

import { validate } from 'schema-utils'

import { schema } from './schema.js'
import { parse } from './parser.js'
import { format } from './formatter.js'
import { dynamicImportsWithoutComments } from 'magic-comments'

import { getCommenter } from './comment.js'

const loader = function (source) {
  const options = this.getOptions()
  const logger = this.getLogger('MCL')

  validate(schema, options, {
    name: 'magic-comments-loader'
  })

  const {
    mode = 'parser',
    match = 'module',
    comments = 'ignore',
    verbose = false,
    ...rest
  } = options
  const magicCommentOptions = Object.keys(rest).length ? rest : { webpackChunkName: true }
  const filepath = this.resourcePath

  if (mode === 'parser') {
    const [magicSource, magicImports] = format({
      ...parse(source),
      match,
      filepath,
      comments,
      magicCommentOptions
    })

    if (verbose) {
      const relativePath = relative(this.rootContext, filepath)

      magicImports.forEach(magicImport => {
        logger.info(`${relativePath} : ${magicImport}`)
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
