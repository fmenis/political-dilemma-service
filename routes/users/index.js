
import createRoute from './create.js'

export default async function index(fastify, opts) {
  fastify.register(createRoute, { prefix: '/v1'})
}