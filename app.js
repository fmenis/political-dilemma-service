import Sensible from 'fastify-sensible'
import Helmet from 'fastify-helmet'
import Cors from 'fastify-cors'
import S from 'fluent-json-schema'
import Env from 'fastify-env'

import swaggerPlugin from './plugins/swagger.js'
import pgPlugin from './plugins/postgres.js'
import redisPlugin from './plugins/redis.js'
import loadSchemasPlugin from './plugins/loadSchemas.js'

import apiPlugin from './routes/index.js'

export default async function app(fastify, opts) {
  fastify.register(Env, {
    data: opts.envData,
    schema: S.object()
      .prop(
        'NODE_ENV',
        S.string().enum(['production', 'development']).required()
      )
      .prop('SERVER_ADDRESS', S.string().default('127.0.0.1'))
      .prop('SERVER_PORT', S.string().default('3000'))
      .prop('LOG_LEVEL', S.string().required())
      .prop('PG_HOST', S.string().required())
      .prop('PG_PORT', S.string().required())
      .prop('PG_DB', S.string().required())
      .prop('PG_PW', S.string().required())
      .prop('REDIS_HOST', S.string().required())
      .prop('REDIS_PORT', S.string().required())
      .prop('SECRET', S.string().required())
      .prop('SESSION_TTL', S.string().default(86400))
      .prop('PG_USER', S.string().required())
      .valueOf(),
  })
  fastify.register(Sensible)
  fastify.register(Helmet, {
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
  fastify.register(Cors, {
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    origin: true,
    credentials: true
  })

  fastify.register(swaggerPlugin)
  fastify.register(pgPlugin)
  fastify.register(redisPlugin)
  fastify.register(loadSchemasPlugin)

  fastify.register(apiPlugin, { prefix: '/api' })
}
