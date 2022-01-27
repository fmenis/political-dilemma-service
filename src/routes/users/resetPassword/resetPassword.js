import S from 'fluent-json-schema'

import { hashString } from '../../../lib/hash.js'

export default async function resetPassword(fastify) {
  const { pg, httpErrors, config } = fastify
  const { createError } = httpErrors

  const emailRegExp =
    // eslint-disable-next-line max-len
    /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})(?=.*[;:_,.\-ç°§òàù@#é*è+[\]{}|!"£$%&/()=?^\\'ì<>])/g
  //TODO capire come fare un file config e metterci questa regexp

  fastify.route({
    method: 'POST',
    path: '/reset-password',
    config: {
      public: true,
    },
    schema: {
      summary: 'Reset password',
      description: 'Reset password.',
      body: S.object()
        .additionalProperties(false)
        .prop('newPassword', S.string().pattern(emailRegExp))
        .description('New password')
        .required()
        .prop('newPasswordConfirmation', S.string().pattern(emailRegExp))
        .description('New paassword confirmation')
        .required()
        .prop('email', S.string().format('email'))
        .description('User email')
        .required(),
      response: {
        204: fastify.getSchema('sNoContent'),
      },
    },
    preHandler: onPreHandler,
    handler: onResetPassword,
  })

  async function onPreHandler(req) {
    const { log } = req
    const { newPassword, newPasswordConfirmation, email } = req.params

    if (newPassword !== newPasswordConfirmation) {
      throw createError(400, 'Invalid input', {
        validation: [
          {
            message: `The 'new' and 'confirmation' password doesn't match`,
          },
        ],
      })
    }

    const user = await pg.execQuery(
      'SELECT * FROM users WHERE email=$1',
      [email],
      { findOne: true }
    )

    //TODO rivedere errori
    if (!user) {
      log.debug(`[reset password] failed: user not found (${user.email})`)
      throw httpErrors.conflict(`User with id '${user.id}' not found`)
    }

    if (user.isBlocked) {
      log.debug(`[reset password] failed: user blocked (${user.email})`)
      throw httpErrors.conflict(`User with id '${user.id}' is blocked`)
    }

    if (user.isDeleted) {
      log.debug(`[reset password] failed: user deleted (${user.email})`)
      throw httpErrors.conflict(`User with id '${user.id}' is deleted`)
    }

    req.user = user
  }

  async function onResetPassword(req, reply) {
    const { user } = req
    const { newPassword } = req.body

    //TODO cancellare tutte le sessioni

    //TODO codice uguale a changePassword. capire se si può fare un service
    const { rowCount } = await pg.execQuery(
      'UPDATE users SET password=$2 WHERE id=$1',
      [user.id, await hashString(newPassword, parseInt(config.SALT_ROUNDS))]
    )

    if (!rowCount) {
      throw httpErrors.conflict('The action had no effect')
    }

    reply.code(204)
  }
}
