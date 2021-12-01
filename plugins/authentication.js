import Fp from 'fastify-plugin'
import cookie from 'fastify-cookie'

import { clearCookie } from '../lib/cookie.js'

async function authentication(fastify) {
  fastify.register(cookie, {
    secret: fastify.config.SECRET,
  })

  async function authenticate(req, reply) {
    const { db, redis, httpErrors } = this
    const { log } = req

    if (reply.context.config.public) {
      return
    }

    const cookie = req.cookies.session
    if (!cookie) {
      log.debug(`Invalid access: cookie not found`)
      throw httpErrors.unauthorized('Authentication error')
    }

    const unsignedCookie = req.unsignCookie(cookie)
    if (!unsignedCookie.valid) {
      log.debug(`Invalid access: malformed cookie`)
      throw httpErrors.unauthorized('Authentication error')
    }

    const { value: sessionId } = unsignedCookie
    const userId = sessionId.split('_')[1]

    const session = await redis.get(sessionId)
    if (!session) {
      clearCookie(reply)
      log.debug(`Invalid access: session not found for user id '${userId}'`)
      throw httpErrors.unauthorized(`Authentication error`)
    }

    if (!session.isValid) {
      log.debug(`Invalid access: session not valid for user id '${userId}'`)
      throw httpErrors.unauthorized(`Authentication error`)
    }

    const user = await db.execQuery(
      'SELECT * FROM users WHERE id=$1',
      [userId],
      { findOne: true }
    )
    if (!user) {
      log.debug(`Invalid access: user '${userId}' not found`)
      throw httpErrors.unauthorized(`Authentication error`)
    }

    if (user.isBlocked) {
      log.warn(`Invalid access: user '${userId}' is blocked`)
      throw httpErrors.forbidden('Authentication error')
    }

    await redis.set(
      sessionId,
      {
        ...session,
        lastActive: new Date(),
      },
      { ttl: fastify.config.SESSION_TTL }
    )

    req.user = user
  }

  fastify.decorateRequest('user', null)
  fastify.addHook('onRequest', authenticate)
}

export default Fp(authentication)
