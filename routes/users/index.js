
import v1 from './v1/index.js'

export default async function index(fastify, opts) {
  fastify.register(v1, { prefix: '/v1'})
}