import authentication from '../plugins/authentication.js'
import { sBadRequest } from './lib/errorSchemas.js'

import authRoutes from './auth/index.js'
import userRoutes from './users/index.js'
import miscRoutes from './misc/index.js'

export default async function index(fastify, opts) {
  fastify.register(authentication)

  fastify.addHook('preHandler', function (req, reply, done) {
    if (req.body) {
      if (req.body.password) {
        req.log.info({ body: {
          ...req.body,
          password: '*'.repeat(req.body.password.length)
        } }, 'parsed body')
      } else {
        req.log.info({ body: req.body }, 'parsed body')
      }
    }
    done()
  })

  fastify.addHook('onRoute', (routeOptions) => {
    routeOptions.schema = {
      ...routeOptions.schema,
      response: {
        ...routeOptions.schema.response,
        400: sBadRequest(),
      }
    }
  })

  fastify.register(authRoutes)
  fastify.register(userRoutes)
  fastify.register(miscRoutes)
}