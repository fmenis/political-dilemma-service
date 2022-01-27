import createRoute from './crud/create.js'
import listRoute from './crud/list.js'
import readRoute from './crud/read.js'
import updateRoute from './crud/update.js'
import deleteRoute from './crud/delete.js'

import changePwRoute from './changePassword.js'
import whoamiRoute from './whoami.js'
import blockRoute from './block.js'
import unblockRoute from './unblock.js'
import sendResetPasswordLink from './resetPassword/sendLink.js'
import checkLink from './resetPassword/checkLink.js'

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
  fastify.register(sendResetPasswordLink, { prefix })
  fastify.register(checkLink, { prefix })
}
