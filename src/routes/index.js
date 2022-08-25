import S from 'fluent-json-schema'

import authentication from '../plugins/authentication.js'
import authorization from '../plugins/authorization.js'

import authRoutes from './auth/index.js'
import userRoutes from './users/index.js'
import miscRoutes from './misc/index.js'
import sessionsRoutes from './sessions/index.js'
import permissionsRoutes from './permissions/index.js'
import rolesRoutes from './roles/index.js'
import resetPasswordRoutes from './resetPassword/index.js'
import articleRoutes from './articles/index.js'
import internalNotesRoutes from './internalNotes/index.js'

export default async function index(fastify) {
  fastify.register(authentication)
  fastify.register(authorization)

  /**
   * Log request body and redact sesible info
   * TODO: https://getpino.io/#/docs/redaction?id=redaction
   */
  fastify.addHook('preValidation', async req => {
    const { body, log, user } = req

    if (user) {
      log.debug(
        {
          id: user.id,
          email: user.email,
        },
        'user'
      )
    }

    if (fastify.config.LOG_REQ_BODY && body) {
      const obscuredKeys = [
        'password',
        'confirmPassword',
        'oldPassword',
        'newPassword',
        'newPasswordConfirmation',
        'token',
      ]

      if (Object.keys(body).some(key => obscuredKeys.includes(key))) {
        const copy = { ...req.body }

        Object.keys(copy).forEach(key => {
          if (obscuredKeys.includes(key)) {
            copy[key] = '*'.repeat(8)
          }
        })

        log.debug(copy, 'parsed body')
      } else {
        log.debug(body, 'parsed body')
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
          .description('Authentication cookie header.')
          .required(),
      }
    }
  })

  /**
   * Log validation errors
   */
  fastify.addHook('onError', async (req, reply, error) => {
    const { log } = req

    error.internalCode = error.internalCode || '0000'
    error.details = {}

    if (reply.statusCode === 400) {
      log.warn({ validation: error.validation }, 'invalid input')

      error.details.validation = error.validation
      error.message = 'Invalid input'
    }
  })

  fastify.register(authRoutes)
  fastify.register(userRoutes)
  fastify.register(miscRoutes)
  fastify.register(sessionsRoutes)
  fastify.register(permissionsRoutes)
  fastify.register(rolesRoutes)
  fastify.register(resetPasswordRoutes)
  fastify.register(articleRoutes)
  fastify.register(internalNotesRoutes)
}
