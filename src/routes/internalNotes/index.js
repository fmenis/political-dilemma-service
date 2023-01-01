import internalNotesErrors from './lib/errors.js'

import createRoute from './create.js'
import listRoute from './list.js'

export default async function index(fastify) {
  fastify.addHook('onRoute', options => {
    options.schema = {
      ...options.schema,
      tags: ['internalNotes'],
    }
  })

  fastify.register(internalNotesErrors)

  const prefix = '/v1/notes'
  fastify.register(createRoute, { prefix })
  fastify.register(listRoute, { prefix })
}
