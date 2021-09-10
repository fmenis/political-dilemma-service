import Sensible from 'fastify-sensible'
import Helmet from 'fastify-helmet'
import Cors from 'fastify-cors'

import apiPlugin from './routes/index.js'
import pgPlugin from './plugins/postgres.js'
import swaggerPlugin from './plugins/swagger.js'

export default async function app(fastify, opts) {
  fastify.register(Sensible)

  fastify.register(Helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
      },
    },
  })

  fastify.register(Cors)

  fastify.register(apiPlugin, { prefix: '/api'})

  fastify.register(pgPlugin)
  fastify.register(swaggerPlugin)
}
