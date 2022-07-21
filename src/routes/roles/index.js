import createRoute from './crud/create.js'
import listRoute from './crud/list.js'
import readRoute from './crud/read.js'
import update from './crud/update.js'
import deleteRoute from './crud/delete.js'

import assingRoute from './userAssign.js'
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

  const prefix = '/v1/roles'

  fastify.register(createRoute, { prefix })
  fastify.register(listRoute, { prefix })
  fastify.register(readRoute, { prefix })
  fastify.register(update, { prefix })
  fastify.register(deleteRoute, { prefix })
  fastify.register(assingRoute, { prefix })
  fastify.register(removeRoute, { prefix })
  fastify.register(permissionsAddRoute, { prefix })
  fastify.register(permissionsRemoveRoute, { prefix })
}
