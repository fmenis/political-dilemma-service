import S from 'fluent-json-schema'
import moment from 'moment'

import { compareStrings } from '../../lib/hash.js'
import { deleteSessions } from '../sessions/lib/utils.js'
import { appConfig } from '../../config/main.js'

export default async function login(fastify) {
  const { pg, httpErrors, config } = fastify
  const { createError } = httpErrors
  const { passwordRexExp } = appConfig

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
        .prop('password', S.string().pattern(passwordRexExp))
        .description('User password.')
        .required()
        .prop('deleteOldest', S.boolean())
        .description('Delete the oldest used session.'),
      response: {
        204: fastify.getSchema('sNoContent'),
      },
    },
    preHandler: onPreHandler,
    handler: onLogin,
  })

  async function onPreHandler(req) {
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

    const userSessionsCount = await countActiveUserSessions(user.id, pg)
    /**
     * Don't stop the logic if the user have reached the sessons
     * limit and 'deleteOldest' is true. Is the only way to allow
     * the user to login in that situation
     */
    if (userSessionsCount === config.SESSIONS_LIMIT && !deleteOldest) {
      log.debug(`Invalid access: session number limit for user '${email}'`)
      throw createError(403, 'Invalid access', {
        internalCode: '0003',
      })
    }

    req.user = user
  }

  async function onLogin(req, reply) {
    const { deleteOldest } = req.body
    const { user } = req

    if (deleteOldest) {
      await deleteOldestActiveUserSession(user.id, pg)
    }

    const query =
      'INSERT INTO sessions (user_id, email, user_agent, expired_at)' +
      'VALUES($1, $2, $3, $4)' +
      'RETURNING id'

    const inputs = [
      user.id,
      user.email,
      req.headers['user-agent'],
      moment().add(config.SESSION_TTL, 'seconds').toDate(),
    ]

    const { rows } = await pg.execQuery(query, inputs)
    const sessionId = rows[0].id

    await pg.execQuery('UPDATE users SET last_access=$2 WHERE id=$1', [
      user.id,
      new Date(),
    ])

    const cookieOptions = {
      path: '/api',
      httpOnly: true,
      signed: true,
      secure: true,
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

  //-------------------------------------- HELPERS ----------------------------

  async function countActiveUserSessions(userId, pg) {
    const query =
      'SELECT COUNT(id) num_sessions FROM sessions ' +
      'WHERE user_id=$1 AND expired_at > $2'

    const { rows } = await pg.execQuery(query, [userId, new Date()])

    return parseInt(rows[0].numSessions)
  }

  async function deleteOldestActiveUserSession(userId, pg) {
    const query = 'SELECT * FROM sessions WHERE user_id=$1 AND expired_at > $2'

    const { rows: userSessions } = await pg.execQuery(query, [
      userId,
      new Date(),
    ])

    if (!userSessions.length) {
      return
    }

    const firstOldest = userSessions.sort(
      (a, b) => new Date(a.lastActive) - new Date(b.lastActive)
    )

    const targetSessionId = firstOldest[0].id
    await deleteSessions([targetSessionId], pg)
  }
}
