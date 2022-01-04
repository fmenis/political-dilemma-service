import createRoute from './create.js'
import listRoute from './list.js'
import readRoute from './read.js'
import updateRoute from './update.js'
import deleteRoute from './delete.js'
import changePwRoute from './changePassword.js'
import whoamiRoute from './whoami.js'
import blockRoute from './block.js'
import unblockRoute from './unblock.js'

export default async function index(fastify) {
  fastify.addHook('onRoute', options => {
    options.schema = {
      ...options.schema,
      tags: ['users'],
    }
  })

  const prefix = '/v1/users'

  fastify.register(createRoute, { prefix })
  fastify.register(listRoute, { prefix })
  fastify.register(readRoute, { prefix })
  fastify.register(updateRoute, { prefix })
  fastify.register(deleteRoute, { prefix })
  fastify.register(changePwRoute, { prefix })
  fastify.register(whoamiRoute, { prefix })
  fastify.register(blockRoute, { prefix })
  fastify.register(unblockRoute, { prefix })
}
