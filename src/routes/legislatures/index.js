import legislatureErrors from './lib/errors.js'

import createRoute from './crud/create.js'
import updateRoute from './crud/update.js'
import listRoute from './crud/list.js'
import readRoute from './crud/read.js'
import deleteRoute from './crud/delete.js'

import duplicateRoute from './duplicate.js'
import addMinistriesRoute from './addMinistries.js'
import updateMinistryRoute from './updateMinistries.js'
import removeMinistriesRoute from './removeMinistries.js'

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
  fastify.register(updateRoute, { prefix })
  fastify.register(listRoute, { prefix })
  fastify.register(readRoute, { prefix })
  fastify.register(deleteRoute, { prefix })

  fastify.register(duplicateRoute, { prefix })
  fastify.register(addMinistriesRoute, { prefix })
  fastify.register(updateMinistryRoute, { prefix })
  fastify.register(removeMinistriesRoute, { prefix })
}
