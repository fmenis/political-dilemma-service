import S from 'fluent-json-schema'
import moment from 'moment'
import shortid from 'shortid'

import { compareStrings } from '../../lib/hash.js'

// use $ and @ instead of - and _
shortid.characters(
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@'
)

export default async function login(fastify) {
  const { pg, redis, httpErrors } = fastify
  const { createError } = httpErrors

  fastify.route({
    method: 'POST',
    path: '/login',
    config: {
      public: true,
    },
    schema: {
      summary: 'Login',
      description: 'Authenticate user into the system.',
      body: S.object()
        .additionalProperties(false)
        .prop('email', S.string().format('email').minLength(6).maxLength(50))
        .description('User email.')
        .required()
        .prop(
          'password',
          S.string().pattern(
            // eslint-disable-next-line max-len
            /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})(?=.*[;:_,.\-ç°§òàù@#é*è+[\]{}|!"£$%&/()=?^\\'ì<>])/g
          )
        )
        .description('User password.')
        .required()
        .prop('deleteOldest', S.boolean())
        .description('Delete the oldest used session.'),
      response: {
        204: fastify.getSchema('sNoContent'),
      },
    },
    handler: onLogin,
  })

  async function onLogin(req, reply) {
    const { email, password, deleteOldest } = req.body
    const { log } = req

    const user = await pg.execQuery(
      'SELECT * FROM users WHERE email=$1',
      [email],
      { findOne: true }
    )

    if (!user) {
      log.debug(`Invalid access: user with email '${email}' not found`)
      throw createError(401, 'Invalid access', {
        internalCode: '0001',
      })
    }

    if (user.isBlocked) {
      log.debug(`Invalid access: login attempt from blocked user '${email}')`)
      throw createError(403, 'Invalid access', {
        internalCode: '0002',
      })
    }

    if (user.isDeleted) {
      log.debug(`Invalid access: login attempt from deleted user '${email}')`)
      throw createError(403, 'Invalid access', {
        internalCode: '0009',
      })
    }

    const match = await compareStrings(password, user.password)
    if (!match) {
      log.debug(`Invalid access: password for user ${email} does not match`)
      throw createError(401, 'Invalid access', {
        internalCode: '0001',
      })
    }

    const sessionKeys = await getUserSessions(user.id, redis)
    if (sessionKeys.length > fastify.config.SESSIONS_LIMIT - 1) {
      log.debug(`Invalid access: session number limit for user '${email}'`)
      throw createError(403, 'Invalid access', {
        internalCode: '0003',
      })
    }

    if (deleteOldest) {
      await deleteOldestUsedSession(user.id, redis)
    }

    const sessionId = `${shortid.generate()}_${user.id}`

    await redis.set(
      sessionId,
      {
        id: sessionId,
        userId: user.id,
        email: user.email,
        createdAt: new Date(),
        userAgent: req.headers['user-agent'],
        lastActive: new Date(),
        isValid: true,
      },
      { ttl: fastify.config.SESSION_TTL }
    )

    const cookieOptions = {
      path: '/api',
      httpOnly: true,
      signed: true,
      // secure: true,
      sameSite: 'none',
      expires: moment().add(fastify.config.COOKIE_TTL, 'seconds').toDate(),
    }

    if (fastify.config.NODE_ENV === 'production') {
      // 'secure' works in the browser, for localhost, but not for postman
      cookieOptions.secure = true
      cookieOptions.sameSite = 'none'
      // cookieOptions.domain = fastify.config.DOMAIN_PROD
    }

    reply.setCookie('session', sessionId, cookieOptions)
    reply.code(204)
  }

  function getUserSessions(userId, redis) {
    return redis.getKeys(`*_${userId}`)
  }

  async function deleteOldestUsedSession(userId, redis) {
    const userSessionKeys = await getUserSessions(userId, redis)
    const userSessions = await redis.getMulti(userSessionKeys)

    const firstOldest = userSessions.sort(
      (a, b) => new Date(a.lastActive) - new Date(b.lastActive)
    )

    const targetSessionId = firstOldest[0].id
    await redis.del(targetSessionId)
  }
}
