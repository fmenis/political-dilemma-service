import sensible from '@fastify/sensible'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import env from '@fastify/env'
import massive from 'fastify-massive'
import sentry from '@immobiliarelabs/fastify-sentry'

import swaggerPlugin from './plugins/swagger.js'
import pgPlugin from './plugins/postgres.js'
import redisPlugin from './plugins/redis.js'
import loadSchemasPlugin from './plugins/loadSchemas.js'
import mailerPlugin from './plugins/mailer.js'
import { sEnv } from './utils/env.schema.js'

import apiPlugin from './routes/index.js'

export default async function app(fastify, opts) {
  fastify.register(env, {
    data: opts.envData,
    schema: sEnv(),
  })
  fastify.register(sensible)
  fastify.register(helmet, {
    contentSecurityPolicy: {
      // helmet + swagger configs
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
      },
    },
  })

  fastify.register(cors, {
    methods: ['POST', 'PUT', 'PATCH', 'DELETE'],
    origin: true,
    credentials: true,
  })

  fastify.register(massive, {
    massive: {
      host: process.env.PG_HOST,
      port: process.env.PG_PORT,
      database: process.env.PG_DB,
      user: process.env.PG_USER,
      password: process.env.PG_PW,
    },
  })

  fastify.register(sentry, {
    dsn: process.env.SENTRY_DSN,
    environment: 'production',
    release: '1.0.0',
    onErrorFactory: () => {
      return function (error, req, reply) {
        reply.send(error)
        if (reply.statusCode === 500) {
          this.Sentry.captureException(error)
        }
      }
    },
  })

  fastify.register(swaggerPlugin)
  fastify.register(pgPlugin)
  fastify.register(redisPlugin)
  fastify.register(loadSchemasPlugin)
  fastify.register(mailerPlugin)

  fastify.register(apiPlugin, { prefix: '/api' })
}
