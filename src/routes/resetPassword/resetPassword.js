import S from 'fluent-json-schema'

import { hashString } from '../../lib/hash.js'
import { deleteUserResetLinks } from './lib/utils.js'
import { appConfig } from '../../config/main.js'

export default async function resetPassword(fastify) {
  const { pg, httpErrors } = fastify
  const { createError } = httpErrors
  const { passwordRexExp, saltRounds } = appConfig

  fastify.route({
    method: 'POST',
    path: '/reset-password',
    config: {
      public: true,
    },
    schema: {
      summary: 'Reset password',
      description: 'Check token and reset user password.',
      body: S.object()
        .additionalProperties(false)
        .prop('token', S.string())
        .description('Reset password token.')
        .required()
        .prop('newPassword', S.string().pattern(passwordRexExp))
        .description('New password.')
        .required()
        .prop('newPasswordConfirmation', S.string().pattern(passwordRexExp))
        .description('New paassword confirmation.')
        .required(),
      response: {
        204: fastify.getSchema('sNoContent'),
        409: fastify.getSchema('sConflict'),
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
      log.debug('[reset password] failed: reset link not found')
      throw createError(403, 'Forbidden', {
        internalCode: '0012',
      })
    }

    if (resetLink.alreadyUsed) {
      log.debug('[reset password] failed: reset link already used')
      throw createError(403, 'Forbidden', {
        internalCode: '0013',
      })
    }

    if (new Date().toISOString() > resetLink.expiredAt.toISOString()) {
      log.debug('[reset password] failed: reset link expired')
      throw createError(403, 'Forbidden', {
        internalCode: '0014',
      })
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
        [user.id, await hashString(newPassword, parseInt(saltRounds))],
        { client }
      )

      await deleteUserResetLinks(user.id, pg)

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
