import S from 'fluent-json-schema'

import authentication from '../plugins/authentication.js'

import authRoutes from './auth/index.js'
import userRoutes from './users/index.js'
import miscRoutes from './misc/index.js'

export default async function index(fastify) {
  fastify.register(authentication)

  /**
   * Log request body
   */
  fastify.addHook('preHandler', function (req, reply, done) {
    const { body } = req

    if (body) {
      const obscuredKeys = [
        'password',
        'oldPassword',
        'newPassword',
        'newPasswordConfirmation',
      ]

      if (Object.keys(body).some(key => obscuredKeys.includes(key))) {
        const copy = { ...req.body }

        Object.keys(copy).forEach(key => {
          if (obscuredKeys.includes(key)) {
            copy[key] = '*'.repeat(copy[key].length)
          }
        })

        req.log.info(copy, 'parsed body')
      } else {
        req.log.info(body, 'parsed body')
      }
    }
    done()
  })

  /**
   * Set common routes stuff
   */
  fastify.addHook('onRoute', options => {
    options.schema = {
      ...options.schema,
      response: {
        ...options.schema.response,
        400: fastify.getSchema('sBadRequest'),
        401: fastify.getSchema('sUnauthorized'),
        403: fastify.getSchema('sForbidden'),
      },
    }

    if (!options.config.public) {
      options.schema = {
        ...options.schema,
        headers: S.object()
          .additionalProperties(true)
          .prop('Cookie', S.string())
          .description('Authentication cookie header')
          .required(),
      }
    }
  })

  fastify.register(authRoutes)
  fastify.register(userRoutes)
  fastify.register(miscRoutes)
}
