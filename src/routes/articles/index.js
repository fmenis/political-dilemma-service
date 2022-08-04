import categoriesRoutes from './categories/index.js'
import tagsRoutes from './tags/index.js'

import createRoute from './crud/create.js'
import listRoute from './crud/list.js'
import deleteRoute from './crud/delete.js'

export default async function index(fastify) {
  fastify.addHook('onRoute', options => {
    options.schema = {
      ...options.schema,
      tags: ['articles'],
    }
  })

  fastify.register(categoriesRoutes)
  fastify.register(tagsRoutes)

  const prefix = '/v1/articles'
  fastify.register(createRoute, { prefix })
  fastify.register(listRoute, { prefix })
  fastify.register(deleteRoute, { prefix })
}
