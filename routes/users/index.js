import createRoute from './create.js'
import listRoute from './list.js'
import readRoute from './read.js'
import deleteRoute from './delete.js'
import changePwRoute from './changePassword.js'

export default async function index(fastify, opts) {
  const prefix = '/v1/users'

  fastify.register(createRoute, { prefix })
  fastify.register(listRoute, { prefix })
  fastify.register(readRoute, { prefix })
  fastify.register(deleteRoute, { prefix })
  fastify.register(changePwRoute, { prefix })
}