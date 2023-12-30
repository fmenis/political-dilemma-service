import groupErrors from './lib/errors.js'

import listRoute from './list.js'

export default async function index(fastify) {
  fastify.addHook('onRoute', options => {
    options.schema = {
      ...options.schema,
      tags: ['groups'],
    }
  })

  const prefix = '/v1/groups'

  fastify.register(groupErrors)
  fastify.register(listRoute, { prefix })
}
