import S from 'fluent-json-schema'
import moment from 'moment'

import { compareStrings } from '../../lib/hash.js'

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
        .prop('password', S.string().minLength(8))
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

    await redis.set(
      user.id.toString(),
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
      sameSite: 'none',
      expires: moment().add(fastify.config.COOKIE_TTL, 'days').toDate(),
    }

    if (fastify.config.NODE_ENV === 'production') {
      cookieOptions.secure = true
    }

    reply.setCookie('session', user.id.toString(), cookieOptions)
    reply.code(204)
  }
}
