import statusRoute from './status.js'

export default async function index(fastify, opts) {
  const prefix = '/v1'

  fastify.register(statusRoute, { prefix })
}