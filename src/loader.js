import { getOptions } from 'loader-utils'

import { getCommenter } from './comment.js'

const dynamicImportsWithoutComments =
  /(?<!\w|\*[\s\w]*?|\/\/\s*)import\s*\((?!\s*\/\*)(?<path>\s*?['"`].+['"`]\s*)\)/g
const loader = function (source, map, meta) {
  const options = getOptions(this)
  const filepath = this.utils.contextify(this.rootContext, this.resourcePath)
  const magicComments = getCommenter(
    filepath.replace(/^\.\/?/, ''),
    Object.keys(options).length > 0 ? options : undefined
  )

  this.callback(
    null,
    source.replace(dynamicImportsWithoutComments, magicComments),
    map,
    meta
  )
}

export { loader }
