import listRoute from './list.js'

export default async function index(fastify) {
  fastify.addHook('onRoute', options => {
    options.schema = {
      ...options.schema,
      tags: ['articles'],
    }
  })

  const prefix = '/v1/articles/categories'

  fastify.register(listRoute, { prefix })
}
