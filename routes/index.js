import S from 'fluent-json-schema'

import authentication from '../plugins/authentication.js'

import authRoutes from './auth/index.js'
import userRoutes from './users/index.js'
import miscRoutes from './misc/index.js'
import sessionsRoutes from './sessions/index.js'

export default async function index(fastify) {
  fastify.register(authentication)

  /**
   * Log request body and redact sesible info
   * TODO: https://getpino.io/#/docs/redaction?id=redaction
   */
  fastify.addHook('preValidation', async req => {
    const { body, log } = req

    if (fastify.config.LOG_REQ_BODY && body) {
      const obscuredKeys = [
        'password',
        'confirmPassword',
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

        log.info(copy, 'parsed body')
      } else {
        log.info(body, 'parsed body')
      }
    }
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

  /**
   * Log validation errors
   */
  fastify.addHook('onError', async (req, reply, error) => {
    const { log } = req

    if (reply.statusCode === 400) {
      log.warn(
        { message: error.message, validation: error.validation },
        'validation error'
      )
    }
  })

  fastify.register(authRoutes)
  fastify.register(userRoutes)
  fastify.register(miscRoutes)
  fastify.register(sessionsRoutes)
}
