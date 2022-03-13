import createRoute from './create.js'
import listRoute from './list.js'

export default async function index(fastify) {
  fastify.addHook('onRoute', options => {
    options.schema = {
      ...options.schema,
      tags: ['articles-categories'],
    }
  })

  const prefix = '/v1/articles/categories'

  fastify.register(createRoute, { prefix })
  fastify.register(listRoute, { prefix })
}
