import miscRoutes from './misc/index.js'
import userRoutes from './users/index.js'

export default async function index(fastify, opts) {
  fastify.register(miscRoutes)
  fastify.register(userRoutes)
}