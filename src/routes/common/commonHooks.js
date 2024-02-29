import fp from 'fastify-plugin'
import S from 'fluent-json-schema'

import { trimObjectFields } from '../common/common.js'

async function commonHooks(fastify) {
  /**
   * Empty object that can be utilized to pass object between hook
   */
  fastify.addHook('onRequest', async req => {
    req.resource = {}
  })

  /**
   * Additional request logs and trim target body fields
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

    if (req.routeOptions.config.trimBodyFields) {
      req.body = trimObjectFields(
        req.routeOptions.config.trimBodyFields,
        req.body
      )
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
        500: fastify.getSchema('sInternalServerError'),
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
    error.message =
      reply.statusCode === 500 ? 'Something went wrong...' : error.message

    if (error.validation) {
      error.details.validation = error.validation
    }
  })

  fastify.addHook('onRequestAbort', async request => {
    const { log } = request
    log.warn('Request aborted!')
  })
}

export default fp(commonHooks)
