import S from 'fluent-json-schema'

import authentication from '../plugins/authentication.js'
import authorization from '../plugins/authorization.js'
import apiCount from '../plugins/apitCount.js'
import activityLogPlugin from '../plugins/activityLog.js'

import authRoutes from './auth/index.js'
import userRoutes from './users/index.js'
import miscRoutes from './misc/index.js'
import sessionsRoutes from './sessions/index.js'
import permissionsRoutes from './permissions/index.js'
import rolesRoutes from './roles/index.js'
import resetPasswordRoutes from './resetPassword/index.js'
import articleRoutes from './articles/index.js'
import internalNotesRoutes from './internalNotes/index.js'
import fielsRoutes from './files/index.js'

export default async function index(fastify) {
  fastify.register(authentication)
  fastify.register(authorization)
  fastify.register(apiCount)
  fastify.register(activityLogPlugin)

  /**
   * Empty object that can be utilized to pass object between hook
   */
  fastify.addHook('onRequest', async req => {
    req.resource = {}
  })

  /**
   * Additional request logs
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

    if (fastify.config.ENABLE_BODY_LOG && body) {
      log.debug(body, 'parsed body')
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
    error.internalCode = error.internalCode || '0000'
    error.details = error.details || {}

    if (error.validation) {
      error.details.validation = error.validation
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
  fastify.register(fielsRoutes)
}
