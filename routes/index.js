import S from 'fluent-json-schema'

import authentication from '../plugins/authentication.js'

import authRoutes from './auth/index.js'
import userRoutes from './users/index.js'
import miscRoutes from './misc/index.js'

export default async function index(fastify, opts) {
  fastify.register(authentication)

  /**
   * Log request body
   */
  fastify.addHook('preHandler', function (req, reply, done) {
    if (req.body) {
      if (req.body.password) {
        req.log.info({
          body: {
            ...req.body,
            password: '*'.repeat(req.body.password.length)
          }
        }, 'parsed body')
      } else {
        req.log.info({ body: req.body }, 'parsed body')
      }
    }
    done()
  })

  /**
   * Set common routes stuff
   */
  fastify.addHook('onRoute', (routeOptions) => {
    routeOptions.schema = {
      ...routeOptions.schema,
      response: {
        ...routeOptions.schema.response,
        400: fastify.getSchema('sBadRequest'),
        401: fastify.getSchema('sUnauthorized'),
        403: fastify.getSchema('sForbidden'),
      }
    }

    if (!routeOptions.config.public) {
      routeOptions.schema = {
        ...routeOptions.schema,
        headers: S.object()
          .additionalProperties(true)
          .prop('Cookie', S.string())
          .description('Autentication header')
          .required(),
      }
    }
  })

  fastify.register(authRoutes)
  fastify.register(userRoutes)
  fastify.register(miscRoutes)
}