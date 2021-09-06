import healthRoute from './misc/health.js'

export default async function index(fastify, opts) {
  fastify.register(healthRoute, { prefix: '/v1' })
}