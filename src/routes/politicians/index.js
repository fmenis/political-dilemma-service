import politicianErrors from './lib/errors.js'

import listRoute from './list.js'
import readRoute from './read.js'

export default async function index(fastify) {
  fastify.addHook('onRoute', options => {
    options.schema = {
      ...options.schema,
      tags: ['politicians'],
    }
  })

  const prefix = '/v1/politicians'

  fastify.register(politicianErrors)
  fastify.register(listRoute, { prefix })
  fastify.register(readRoute, { prefix })
}
