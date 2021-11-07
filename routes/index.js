import S from 'fluent-json-schema'

import authentication from '../plugins/authentication.js'
import { sBadRequest, sUnauthorized, sForbidden } from './lib/errorSchemas.js'

import authRoutes from './auth/index.js'
import userRoutes from './users/index.js'
import miscRoutes from './misc/index.js'

export default async function index(fastify, opts) {
  fastify.register(authentication)

  /**
   * Log request body
   */
  fastify.addHook('preHandler', function (req, reply, done) {
    // log request body
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
        400: sBadRequest(),
        401: sUnauthorized(),
        403: sForbidden(),
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