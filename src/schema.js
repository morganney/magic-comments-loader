import { schema as webpackChunkNameSchema } from './webpackChunkName.js'
import { schema as webpackFetchPrioritySchema } from './webpackFetchPriority.js'
import { schema as webpackModeSchema } from './webpackMode.js'
import { schema as webpackIgnoreSchema } from './webpackIgnore.js'
import { schema as webpackPrefetchSchema } from './webpackPrefetch.js'
import { schema as webpackPreloadSchema } from './webpackPreload.js'
import { schema as webpackExportsSchema } from './webpackExports.js'
import { schema as webpackIncludeSchema } from './webpackInclude.js'
import { schema as webpackExcludeSchema } from './webpackExclude.js'

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
    webpackFetchPriority: webpackFetchPrioritySchema,
    webpackMode: webpackModeSchema,
    webpackIgnore: webpackIgnoreSchema,
    webpackPrefetch: webpackPrefetchSchema,
    webpackPreload: webpackPreloadSchema,
    webpackExports: webpackExportsSchema,
    webpackInclude: webpackIncludeSchema,
    webpackExclude: webpackExcludeSchema
  },
  additionalProperties: false
}

export { schema }
