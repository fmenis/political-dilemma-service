import articleErrors from './lib/activity.errors.js'

import createRoute from './crud/create.js'
import listRoute from './crud/list.js'
import readRoute from './crud/read.js'

export default async function index(fastify) {
  fastify.addHook('onRoute', options => {
    options.schema = {
      ...options.schema,
      tags: ['activities'],
    }
  })

  fastify.register(articleErrors)

  const prefix = '/v1/activities'
  fastify.register(createRoute, { prefix })
  fastify.register(listRoute, { prefix })
  fastify.register(readRoute, { prefix })
}
