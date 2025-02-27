import statusRoute from './status.js'
import regionsRoute from './regions.js'
import ProvinceRoute from './provinces.js'

export default async function index(fastify) {
  fastify.addHook('onRoute', options => {
    options.schema = {
      ...options.schema,
      tags: ['misc'],
    }
  })

  const prefix = '/v1'

  fastify.register(statusRoute, { prefix })
  fastify.register(regionsRoute, { prefix })
  fastify.register(ProvinceRoute, { prefix })
}
