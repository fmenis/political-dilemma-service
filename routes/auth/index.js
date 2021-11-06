import loginRoute from './login.js'
import logoutRoute from './logout.js'

export default async function index(fastify, opts) {
  fastify.register(loginRoute, { prefix: '/v1/auth' })
  fastify.register(logoutRoute, { prefix: '/v1/auth' })
}