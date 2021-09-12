import { schema as webpackChunkNameSchema } from './webpackChunkName.js'
import { schema as webpackModeSchema } from './webpackMode.js'
import { schema as webpackIgnoreSchema } from './webpackIgnore.js'
import { schema as webpackPrefetchSchema } from './webpackPrefetch.js'
import { schema as webpackPreloadSchema } from './webpackPreload.js'
import { schema as webpackExportsSchema } from './webpackExports.js'

const schema = {
  type: 'object',
  properties: {
    verbose: {
      type: 'boolean'
    },
    match: {
      enum: ['module', 'import']
    },
    webpackChunkName: webpackChunkNameSchema,
    webpackMode: webpackModeSchema,
    webpackIgnore: webpackIgnoreSchema,
    webpackPrefetch: webpackPrefetchSchema,
    webpackPreload: webpackPreloadSchema,
    webpackExports: webpackExportsSchema
  },
  additionalProperties: false
}

export { schema }
