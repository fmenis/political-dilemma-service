import Sensible from 'fastify-sensible'
import Helmet from 'fastify-helmet'
import Cors from 'fastify-cors'

import apiPlugin from './routes/index.js'
import pgPlugin from './plugins/postgres.js'

export default async function app(fastify, opts) {
  fastify.register(Sensible)

  fastify.register(Helmet)
  fastify.register(Cors)

  fastify.register(apiPlugin, { prefix: '/api'})

  fastify.register(pgPlugin)
}
