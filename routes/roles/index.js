import createRoute from './create.js'
import listRoute from './list.js'
import deleteRoute from './delete.js'
import assingRoute from './assign.js'
import removeRoute from './remove.js'

export default async function index(fastify) {
  fastify.addHook('onRoute', options => {
    options.schema = {
      ...options.schema,
      tags: ['roles'],
    }
  })

  const prefix = '/v1/roles'

  fastify.register(createRoute, { prefix })
  fastify.register(listRoute, { prefix })
  fastify.register(deleteRoute, { prefix })
  fastify.register(assingRoute, { prefix })
  fastify.register(removeRoute, { prefix })
}
