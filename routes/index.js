import authentication from '../plugins/authentication.js'

import authRoutes from './auth/index.js'
import userRoutes from './users/index.js'
import miscRoutes from './misc/index.js'

export default async function index(fastify, opts) {
  fastify.register(authentication)

  fastify.register(authRoutes)
  fastify.register(userRoutes)
  fastify.register(miscRoutes)
}