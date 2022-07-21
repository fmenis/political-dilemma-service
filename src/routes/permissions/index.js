import listRoute from './list.js'

export default async function index(fastify) {
  fastify.addHook('onRoute', options => {
    options.schema = {
      ...options.schema,
      tags: ['permissions'],
    }
  })

  const prefix = '/v1/permissions'

  fastify.register(listRoute, { prefix })
}
