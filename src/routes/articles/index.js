import articleErrors from './lib/articleErrors.js'
import categoriesRoutes from './crud/categories/index.js'

import createRoute from './crud/create.js'
import listRoute from './crud/list.js'
import readRoute from './crud/read.js'
import updateRoute from './crud/update.js'
import deleteRoute from './crud/delete.js'

import reviewRoute from './review.js'
import approveRoute from './approve.js'
import reworkRoute from './rework.js'
import publishRoute from './publish.js'
import archiveRoute from './archive.js'

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

  fastify.register(reviewRoute, { prefix })
  fastify.register(approveRoute, { prefix })
  fastify.register(reworkRoute, { prefix })
  fastify.register(publishRoute, { prefix })
  fastify.register(archiveRoute, { prefix })
}
