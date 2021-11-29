import listRoute from './list.js'

export default async function index(fastify) {
  fastify.addHook('onRoute', options => {
    options.schema = {
      ...options.schema,
      tags: ['sessions'],
    }
  })

  const prefix = '/v1/sessions'

  fastify.register(listRoute, { prefix })
}
