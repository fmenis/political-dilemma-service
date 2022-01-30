import S from 'fluent-json-schema'

import { hashString } from '../../../lib/hash.js'
// import { passwordRexExp } from '../../../config/main.js'

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
        .prop('token', S.string())
        .description('Reset password token')
        .required()
        .prop('newPassword', S.string().pattern(emailRegExp))
        .description('New password')
        .required()
        .prop('newPasswordConfirmation', S.string().pattern(emailRegExp))
        .description('New paassword confirmation')
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
    const { token, newPassword, newPasswordConfirmation } = req.body

    const resetLink = await pg.execQuery(
      'SELECT * FROM reset_links WHERE token=$1',
      [token],
      { findOne: true }
    )

    if (!resetLink) {
      log.debug('[reset password] failed: rest link not found')
      throw httpErrors.conflict(`Reset link not found`)
    }

    if (resetLink.alreadyUsed) {
      log.debug('[reset password] failed: rest link already used')
      throw httpErrors.conflict(`Reset link already used`)
    }

    if (new Date().toISOString() > resetLink.expiredAt.toISOString()) {
      log.debug('[reset password] failed: rest link expired')
      throw httpErrors.conflict(`Reset link expired`)
    }

    const user = await pg.execQuery(
      'SELECT * FROM users WHERE id=$1',
      [resetLink.userId],
      { findOne: true }
    )

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

    if (newPassword !== newPasswordConfirmation) {
      throw createError(400, 'Invalid input', {
        validation: [
          {
            message: `The 'new' and 'confirmation' password doesn't match`,
          },
        ],
      })
    }

    req.user = {
      ...user,
      resetLinkId: resetLink.id,
    }
  }

  async function onResetPassword(req, reply) {
    const { user } = req
    const { newPassword } = req.body

    let client

    try {
      client = await pg.beginTransaction()

      await pg.execQuery(
        'UPDATE users SET password=$2 WHERE id=$1',
        [user.id, await hashString(newPassword, parseInt(config.SALT_ROUNDS))],
        { client }
      )

      await pg.execQuery(
        'UPDATE reset_links SET already_used=$2 WHERE id=$1',
        [user.resetLinkId, true],
        { client }
      )

      await pg.execQuery('DELETE FROM sessions WHERE user_id=$1', [user.id], {
        client,
      })

      await pg.commitTransaction(client)
      reply.code(204)
    } catch (error) {
      await pg.rollbackTransaction(client)
      throw error
    }
  }
}
