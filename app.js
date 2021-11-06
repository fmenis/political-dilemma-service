import Sensible from 'fastify-sensible'
import Helmet from 'fastify-helmet'
import Cors from 'fastify-cors'

import swaggerPlugin from './plugins/swagger.js'
import pgPlugin from './plugins/postgres.js'
import redisPlugin from './plugins/redis.js'

import apiPlugin from './routes/index.js'

export default async function app(fastify, opts) {
  fastify.register(Sensible)
  fastify.register(Helmet, {
    contentSecurityPolicy: { // helmet + swagger configs
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
      },
    },
  })
  fastify.register(Cors)

  fastify.register(swaggerPlugin)
  fastify.register(pgPlugin)
  fastify.register(redisPlugin)

  fastify.register(apiPlugin, { prefix: '/api'})
}
