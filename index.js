import Fastify from 'fastify'
import S from 'fluent-json-schema'
import Env from 'fastify-env'

import App from './app.js'

const fastify = Fastify({
	logger: {
		level: process.env.LOG_LEVEL,
		prettyPrint: process.env.NODE_ENV !== 'production'
	},
})

fastify.register(Env, {
  schema: S.object()
    .prop('NODE_ENV', S.string().enum(['production', 'development']).required())
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
    .valueOf()
})

fastify.register(App)

const port = process.env.SERVER_PORT || 3000
const address = process.env.SERVER_ADDRESS || '127.0.0.1'

fastify.listen(port, address, err => {  
  if (err) {
    fastify.log.fatal(err)
    process.exit(1)
  }
  fastify.log.debug(`Server launched in ${process.env.NODE_ENV} mode`)
})

/**
 * TODO
 * - gracefull shutdown
 * - linting
 * - API versioning
 */