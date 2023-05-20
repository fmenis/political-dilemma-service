import listRoute from './list.js'

export default async function index(fastify) {
  fastify.addHook('onRoute', options => {
    options.schema = {
      ...options.schema,
      tags: ['categories'],
    }
  })

  const prefix = '/v2/categories'

  fastify.register(listRoute, { prefix })
}
