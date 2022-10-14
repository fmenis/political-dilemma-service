import articleErrors from './lib/articleErrors.js'
import categoriesRoutes from './crud/categories/index.js'

import createRoute from './crud/create.js'
import listRoute from './crud/list.js'
import readRoute from './crud/read.js'
import updateRoute from './crud/update.js'
import deleteRoute from './crud/delete.js'

import reviewActionRoute from './review.js'
import approveActionRoute from './approve.js'
import reworkActionRoute from './rework.js'
import publishActionRoute from './publish.js'
import archiveActionRoute from './archive.js'
import deleteActionRoute from './delete.js'

export default async function index(fastify) {
  fastify.addHook('onRoute', options => {
    options.schema = {
      ...options.schema,
      tags: ['articles'],
    }
  })

  fastify.register(articleErrors)
  fastify.register(categoriesRoutes)

  const prefix = '/v1/articles'

  fastify.register(createRoute, { prefix })
  fastify.register(listRoute, { prefix })
  fastify.register(readRoute, { prefix })
  fastify.register(updateRoute, { prefix })
  fastify.register(deleteRoute, { prefix })

  fastify.register(reviewActionRoute, { prefix })
  fastify.register(approveActionRoute, { prefix })
  fastify.register(reworkActionRoute, { prefix })
  fastify.register(publishActionRoute, { prefix })
  fastify.register(archiveActionRoute, { prefix })
  fastify.register(deleteActionRoute, { prefix })
}
