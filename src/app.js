import Sensible from 'fastify-sensible'
import Helmet from 'fastify-helmet'
import Cors from 'fastify-cors'
import S from 'fluent-json-schema'
import Env from 'fastify-env'

import swaggerPlugin from './plugins/swagger.js'
import pgPlugin from './plugins/postgres.js'
import redisPlugin from './plugins/redis.js'
import loadSchemasPlugin from './plugins/loadSchemas.js'
import mailerPlugin from './plugins/mailer.js'

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
      .prop('DOMAIN_PROD', S.string())
      .required()
      .prop('LOG_LEVEL', S.string().required())
      .prop('SESSIONS_LIMIT', S.number().default(4))
      .prop('PG_HOST', S.string().required())
      .prop('PG_PORT', S.string().required())
      .prop('PG_DB', S.string().required())
      .prop('PG_USER', S.string().required())
      .prop('PG_PW', S.string().required())
      .prop('REDIS_HOST', S.string().required())
      .prop('REDIS_PORT', S.string().required())
      .prop('SECRET', S.string().required())
      .prop('SESSION_TTL', S.string().default(1800))
      .prop('COOKIE_TTL', S.string().default(86400 * 180))
      .prop('RESET_LINK_TTL', S.number().default(7200))
      .prop('LOG_REQ_BODY', S.boolean().default(false))
      .prop('AWS_REGION', S.string().required())
      .prop('AWS_ACCESS_KEY_ID', S.string().required())
      .prop('AWS_SECRET_ACCESS_KEY', S.string().required())
      .prop('SENDER_EMAIL', S.string().required())
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
    //TODO non dovrebbe servire per le POST, testare
    methods: ['POST', 'PUT', 'DELETE'],
    origin: true,
    credentials: true,
  })

  // fastify.register(Cors, function (instance) {
  //   return (req, callback) => {
  //     let corsOptions
  //     const origin = req.headers.origin
  //     // do not include CORS headers for requests from localhost
  //     if (/localhost/.test(origin)) {
  //       corsOptions = { origin: true }
  //     } else {
  //       corsOptions = { origin: true }
  //     }
  //     corsOptions.credentials = true
  //     callback(null, corsOptions)
  //   }
  // })

  fastify.register(swaggerPlugin)
  fastify.register(pgPlugin)
  fastify.register(redisPlugin)
  fastify.register(loadSchemasPlugin)
  fastify.register(mailerPlugin)

  fastify.register(apiPlugin, { prefix: '/api' })
}
