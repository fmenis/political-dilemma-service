import createRoute from './create.js'
// import listRoute from '../users/list.js'
// import readRoute from '../users/read.js'
// import updateRoute from '../users/update.js'
// import deleteRoute from '../users/delete.js'
// import changePwRoute from '../users/changePassword.js'
// import whoamiRoute from '../users/whoami.js'

export default async function index(fastify) {
  fastify.addHook('onRoute', options => {
    options.schema = {
      ...options.schema,
      tags: ['permissions'],
    }
  })

  const prefix = '/v1/permissions'

  fastify.register(createRoute, { prefix })
  // fastify.register(listRoute, { prefix })
  // fastify.register(readRoute, { prefix })
  // fastify.register(updateRoute, { prefix })
  // fastify.register(deleteRoute, { prefix })
  // fastify.register(changePwRoute, { prefix })
  // fastify.register(whoamiRoute, { prefix })
}
