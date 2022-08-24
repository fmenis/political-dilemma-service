import uploadRoute from './upload.js'
import deleteRoute from './delete.js'

export default async function index(fastify) {
  fastify.addHook('onRoute', options => {
    options.schema = {
      ...options.schema,
      tags: ['files'],
    }
  })

  const prefix = '/v1/files'
  fastify.register(uploadRoute, { prefix })
  fastify.register(deleteRoute, { prefix })
}
