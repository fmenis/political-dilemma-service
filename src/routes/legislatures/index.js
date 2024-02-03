import legislatureErrors from './lib/errors.js'

import createRoute from './crud/create.js'

export default async function index(fastify) {
  fastify.addHook('onRoute', options => {
    options.schema = {
      ...options.schema,
      tags: ['legislatures'],
    }
  })

  const prefix = '/v1/legislatures'

  fastify.register(legislatureErrors)
  fastify.register(createRoute, { prefix })
}
