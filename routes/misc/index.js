import statusRoute from './status.js'

export default async function index(fastify, opts) {
  fastify.addHook('onRoute', options => {
    options.schema = {
      ...options.schema,
      tags: ['misc']
    }
  })

  const prefix = '/v1'

  fastify.register(statusRoute, { prefix })
}