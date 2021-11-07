import loginRoute from './login.js'
import logoutRoute from './logout.js'

export default async function index(fastify, opts) {
  fastify.addHook('onRoute', options => {
    options.schema = {
      ...options.schema,
      tags: ['auth']
    }
  })

  const prefix = '/v1/auth'

  fastify.register(loginRoute, { prefix })
  fastify.register(logoutRoute, { prefix })
}