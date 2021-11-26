import S from 'fluent-json-schema'
import moment from 'moment'
import shortid from 'shortid'

import { compareStrings } from '../../lib/hash.js'

// use $ and @ instead of - and _
shortid.characters(
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@'
)

export default async function login(fastify) {
  const { db, log, redis, httpErrors } = fastify

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
        .description('User email')
        .required()
        .prop(
          'password',
          S.string().pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/g)
        )
        .description('User password')
        .required(),
      response: {
        204: fastify.getSchema('sNoContent'),
      },
    },
    handler: onLogin,
  })

  async function onLogin(req, reply) {
    const { email, password } = req.body

    const user = await db.findOne('SELECT * FROM users WHERE email=$1', [email])

    if (!user) {
      log.debug(`Invalid access: user with email '${email}' not found`)
      throw httpErrors.unauthorized('Invalid email or password')
    }

    if (user.isBlocked) {
      log.debug(`Invalid access: login attempt from blocked user '${email}')`)
      throw httpErrors.forbidden(`Invalid email or password`)
    }

    const match = await compareStrings(password, user.password)
    if (!match) {
      log.debug(`Invalid access: password for user ${email} does not match`)
      throw httpErrors.unauthorized('Invalid email or password')
    }

    const sessionId = `${shortid.generate()}_${user.id}`

    await redis.set(
      sessionId,
      {
        userId: user.id,
        email: user.email,
        createdAt: new Date(),
        isValid: true,
      },
      { ttl: fastify.config.SESSION_TTL }
    )

    const cookieOptions = {
      domain: 'localhost',
      path: '/api',
      httpOnly: true,
      signed: true,
      sameSite: 'lax',
      expires: moment().add(fastify.config.COOKIE_TTL, 'seconds').toDate(),
    }

    if (fastify.config.NODE_ENV === 'production') {
      // 'secure' works in the browser, for localhost, but not for postman
      cookieOptions.secure = true
      cookieOptions.sameSite = 'strict'
    }

    reply.setCookie('session', sessionId, cookieOptions)
    reply.code(204)
  }
}
