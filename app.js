import Sensible from 'fastify-sensible'
import Helmet from 'fastify-helmet'
import Cors from 'fastify-cors'
import Autoload from 'fastify-autoload'
import { join } from 'desm'

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

  fastify.register(Autoload, {
    dir: join(import.meta.url, 'plugins'),
    opts
  })

  fastify.register(apiPlugin, { prefix: '/api'})
}
