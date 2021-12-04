import Fp from 'fastify-plugin'
import cookie from 'fastify-cookie'

import { clearCookie } from '../lib/cookie.js'

async function authentication(fastify) {
  fastify.register(cookie, {
    secret: fastify.config.SECRET,
  })

  async function authenticate(req, reply) {
    const { db, redis, httpErrors } = this
    const { createError } = httpErrors
    const { log } = req

    if (reply.context.config.public) {
      return
    }

    const cookie = req.cookies.session
    if (!cookie) {
      log.debug(`Invalid access: cookie not found`)
      throw createError(401, 'Invalid access', {
        internalCode: '0004',
      })
    }

    const unsignedCookie = req.unsignCookie(cookie)
    if (!unsignedCookie.valid) {
      log.debug(`Invalid access: malformed cookie`)
      throw createError(401, 'Invalid access', {
        internalCode: '0004',
      })
    }

    const { value: sessionId } = unsignedCookie
    const userId = sessionId.split('_')[1]

    const session = await redis.get(sessionId)
    if (!session) {
      log.debug(`Invalid access: session not found for user id '${userId}'`)
      throw createError(401, 'Invalid access', {
        internalCode: '0005',
      })
    }

    if (!session.isValid) {
      log.debug(`Invalid access: session not valid for user id '${userId}'`)
      throw createError(403, 'Invalid access', {
        internalCode: '0006',
      })
    }

    const user = await db.execQuery(
      'SELECT * FROM users WHERE id=$1',
      [userId],
      { findOne: true }
    )
    if (!user) {
      log.debug(`Invalid access: user '${userId}' not found`)
      throw createError(401, 'Invalid access', {
        internalCode: '0007',
      })
    }

    if (user.isBlocked) {
      log.warn(`Invalid access: user '${userId}' is blocked`)
      throw createError(403, 'Invalid access', {
        internalCode: '0002',
      })
    }

    await redis.set(
      sessionId,
      {
        ...session,
        lastActive: new Date(),
      },
      { ttl: fastify.config.SESSION_TTL }
    )

    req.user = {
      ...user,
      session,
    }
  }

  fastify.decorateRequest('user', null)
  fastify.addHook('onRequest', authenticate)
}

export default Fp(authentication)
