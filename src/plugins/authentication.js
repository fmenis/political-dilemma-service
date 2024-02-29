import Fp from 'fastify-plugin'
import cookie from 'fastify-cookie'
import moment from 'moment'

async function authentication(fastify) {
  fastify.register(cookie, {
    secret: fastify.config.SECRET,
  })

  async function authenticate(req, reply) {
    const { pg, httpErrors, config } = this
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
        internalCode: '0005',
      })
    }

    const { value: sessionId } = unsignedCookie

    const session = await pg.execQuery(
      'SELECT * FROM sessions WHERE id=$1',
      [sessionId],
      { findOne: true }
    )

    if (!session) {
      log.debug(`Invalid access: session not found`)
      throw createError(401, 'Invalid access', {
        internalCode: '0006',
      })
    }

    if (new Date().toISOString() > new Date(session.expiredAt).toISOString()) {
      log.debug(`Invalid access: session expired`)
      throw createError(401, 'Invalid access', {
        internalCode: '0011',
      })
    }

    if (!session.isValid) {
      log.debug(`Invalid access: session not valid`)
      throw createError(403, 'Invalid access', {
        internalCode: '0007',
      })
    }

    const user = await pg.execQuery(
      'SELECT id, first_name, last_name, email, is_blocked, is_deleted, type, password FROM users WHERE id=$1',
      [session.userId],
      { findOne: true }
    )

    if (!user) {
      log.debug(`Invalid access: user not found`)
      throw createError(401, 'Invalid access', {
        internalCode: '0008',
      })
    }

    await pg.execQuery(
      'UPDATE sessions SET last_active=$2, expired_at=$3 WHERE id=$1',
      [
        session.id,
        new Date(),
        moment().add(config.SESSION_TTL, 'seconds').toDate(),
      ]
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
