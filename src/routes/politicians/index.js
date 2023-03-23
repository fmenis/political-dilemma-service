import politicianErrors from './lib/politician.errors.js'
import politicianService from './politician.service.js'
import politicianController from './politician.controller.js'
import politicianPublicRouter from './politicianPublic.router.js'
import politicianRouter from './politician.router.js'

export default async function index(fastify) {
  fastify.addHook('onRoute', options => {
    options.schema = {
      ...options.schema,
      tags: ['politicians'],
    }
  })

  fastify.register(politicianErrors)
  fastify.register(politicianService)
  fastify.register(politicianController)
  fastify.register(politicianPublicRouter, { prefix: '/v1/public/politicians' })
  fastify.register(politicianRouter, { prefix: '/v1/politicians' })
}
