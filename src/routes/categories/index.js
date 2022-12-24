import S from 'fluent-json-schema'

import listRoute from './list.js'

export default async function index(fastify) {
  fastify.addHook('onRoute', options => {
    options.schema = {
      ...options.schema,
      tags: ['categories'],
    }
  })

  //TODO mettere questo dentro commonHooks quando sarà standard per tutti
  fastify.addHook('onRoute', options => {
    options.schema = {
      ...options.schema,
      headers: S.object()
        .additionalProperties(true)
        .prop('Accept-Version', S.string())
        .description('Api version.')
        .examples(['1.0.0', '2.0.0'])
        .required()
        .extend(options.schema.headers),
    }
  })

  const prefix = '/categories'

  fastify.register(listRoute, { prefix })
}
