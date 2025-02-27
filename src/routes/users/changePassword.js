import S from 'fluent-json-schema'
import { compareStrings, hashString } from '../../lib/hash.js'
import { appConfig } from '../../config/main.js'

export default async function changePassword(fastify) {
  const { pg, httpErrors } = fastify
  const { createError } = httpErrors
  const { passwordRexExp, saltRounds } = appConfig

  fastify.route({
    method: 'POST',
    path: '/:id/change-password',
    config: {
      public: false,
    },
    schema: {
      summary: 'Change password',
      description:
        'Change user password. API to be used when the user is logged in.',
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.string().format('uuid'))
        .description('User id.')
        .required(),
      body: S.object()
        .additionalProperties(false)
        .prop('oldPassword', S.string().pattern(passwordRexExp))
        .description('Current password.')
        .required()
        .prop('newPassword', S.string().pattern(passwordRexExp))
        .description('New password.')
        .required()
        .prop('newPasswordConfirmation', S.string().pattern(passwordRexExp))
        .description('New password confirmation.')
        .required(),
      response: {
        200: fastify.getSchema('sNoContent'),
        409: fastify.getSchema('sConflict'),
      },
    },
    handler: onChangePassword,
  })

  async function onChangePassword(req, reply) {
    const { oldPassword, newPassword, newPasswordConfirmation } = req.body
    const { user } = req

    const match = await compareStrings(oldPassword, user.password)
    if (!match) {
      throw createError(400, 'Invalid input', {
        validation: [{ message: 'Old password not valid' }],
      })
    }

    if (newPassword === oldPassword) {
      throw createError(400, 'Invalid input', {
        validation: [{ message: 'New password is the same as the previous' }],
      })
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

    const inputs = [
      user.id,
      await hashString(newPassword, parseInt(saltRounds)),
    ]

    const { rowCount } = await pg.execQuery(
      'UPDATE users SET password=$2 WHERE id=$1',
      inputs
    )

    if (!rowCount) {
      throw httpErrors.conflict('The action had no effect')
    }

    reply.code(204)
  }
}
