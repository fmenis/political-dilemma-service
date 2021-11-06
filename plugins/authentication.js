import Fp from 'fastify-plugin'
import cookie from 'fastify-cookie'

import { clearCookie } from '../lib/cookie.js'

async function authentication(fastify, opts) {
  fastify.register(cookie, {
    secret: fastify.config.SECRET
  })

  async function authenticate(req, reply) {
    const { db, redis, httpErrors, log } = this

    if (reply.context.config.public) {
      return
    }

    const cookie = req.cookies.session
    if (!cookie) {
      log.debug(`Invalid access: cookie not found`)
      throw httpErrors.unauthorized('Authentication error')
    }

    const unsigned_cookie = req.unsignCookie(cookie);
    if (!unsigned_cookie.valid) {
      log.debug(`Invalid access: malformed cookie`)
      throw httpErrors.unauthorized('Authentication error')
    }

    const { value: user_id } = unsigned_cookie

    const session = await redis.get(user_id)
    if (!session) {
      clearCookie(reply)
      log.debug(`Invalid access: session not found for user '${user_id}'`)
      throw httpErrors.unauthorized(`Authentication error`)
    }

    if (!session.is_valid) {
      log.debug(`Invalid access: session not valid for user '${user_id}'`)
      throw httpErrors.unauthorized(`Authentication error`)
    }

    const user = await db.findOne('SELECT * FROM users WHERE id=$1', [user_id])
    if (!user) {
      log.debug(`Invalid access: user '${user_id}' not found`)
      throw httpErrors.unauthorized(`Authentication error`)
    }

    if (user.is_blocked) {
      log.warn(`Invalid access: user '${user_id}' is blocked`)
      throw httpErrors.forbidden('Authentication error')
    }

    await redis.setExpireTime(user_id, fastify.config.SESSION_TTL)
    req.user = user
  }

  fastify.decorateRequest('user', null)
  fastify.addHook('onRequest', authenticate)
}

export default Fp(authentication)