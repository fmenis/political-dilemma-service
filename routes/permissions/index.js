import createRoute from './create.js'
import listRoute from './list.js'
import deleteRoute from './delete.js'

export default async function index(fastify) {
  fastify.addHook('onRoute', options => {
    options.schema = {
      ...options.schema,
      tags: ['permissions'],
    }
  })

  const prefix = '/v1/permissions'

  fastify.register(createRoute, { prefix })
  fastify.register(listRoute, { prefix })
  fastify.register(deleteRoute, { prefix })
}
