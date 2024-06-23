import roleErrors from './lib/roleErrors.js'

import createRoute from './crud/create.js'
import listRoute from './crud/list.js'
import readRoute from './crud/read.js'
import updateRoute from './crud/update.js'
import deleteRoute from './crud/delete.js'

import assignRoute from './userAssign.js'
import removeRoute from './userRemove.js'
import permissionsAddRoute from './permissionsAdd.js'
import permissionsRemoveRoute from './permissionsRemove.js'

export default async function index(fastify) {
  fastify.addHook('onRoute', options => {
    options.schema = {
      ...options.schema,
      tags: ['roles'],
    }
  })

  fastify.register(roleErrors)

  const prefix = '/v1/roles'

  fastify.register(createRoute, { prefix })
  fastify.register(listRoute, { prefix })
  fastify.register(readRoute, { prefix })
  fastify.register(updateRoute, { prefix })
  fastify.register(deleteRoute, { prefix })
  fastify.register(assignRoute, { prefix })
  fastify.register(removeRoute, { prefix })
  fastify.register(permissionsAddRoute, { prefix })
  fastify.register(permissionsRemoveRoute, { prefix })
}
