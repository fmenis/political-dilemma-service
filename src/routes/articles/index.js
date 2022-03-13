import createRoute from './crud/create.js'
import listRoute from './crud/list.js'
import categoriesRoutes from './categories/index.js'

export default async function index(fastify) {
  fastify.addHook('onRoute', options => {
    options.schema = {
      ...options.schema,
      tags: ['articles'],
    }
  })

  const prefix = '/v1/articles'

  fastify.register(createRoute, { prefix })
  fastify.register(listRoute, { prefix })
  fastify.register(categoriesRoutes)
}
