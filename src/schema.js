import { schema as webpackChunkNameSchema } from './webpackChunkName.js'
import { schema as webpackModeSchema } from './webpackMode.js'
import { schema as webpackIgnoreSchema } from './webpackIgnore.js'
import { schema as webpackPrefetchSchema } from './webpackPrefetch.js'
import { schema as webpackPreloadSchema } from './webpackPreload.js'

const schema = {
  type: 'object',
  properties: {
    verbose: {
      type: 'boolean'
    },
    webpackChunkName: webpackChunkNameSchema,
    webpackMode: webpackModeSchema,
    webpackIgnore: webpackIgnoreSchema,
    webpackPrefetch: webpackPrefetchSchema,
    webpackPreload: webpackPreloadSchema
  },
  additionalProperties: false
}

export { schema }
