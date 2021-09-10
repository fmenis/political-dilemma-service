import statusRoute from './status.js'

export default async function index(fastify, opts) {
  fastify.register(statusRoute, { prefix: '/v1' })
}