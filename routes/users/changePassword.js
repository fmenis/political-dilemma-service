import S from 'fluent-json-schema'
import { compareStrings, hashString } from '../../lib/hash.js'

export default async function changePassword(fastify) {
  const { db, config, httpErrors } = fastify
  const { createError } = httpErrors

  fastify.route({
    method: 'POST',
    path: '/:id/change-password',
    config: {
      public: false,
    },
    schema: {
      summary: 'Change user password',
      description: 'Change user password.',
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.integer().minimum(1))
        .description('User id')
        .required(),
      body: S.object()
        .additionalProperties(false)
        .prop(
          'oldPassword',
          S.string().pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/g)
        )
        .description('Current password')
        .required()
        .prop(
          'newPassword',
          S.string().pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/g)
        )
        .description('New password')
        .required()
        .prop(
          'newPasswordConfirmation',
          S.string().pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/g)
        )
        .description('New password confirmation')
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
      throw createError(400, 'Bad Request', {
        validation: [`Old password not valid`],
      })
    }

    if (newPassword === oldPassword) {
      throw createError(400, 'Bad Request', {
        validation: [`New password is the same as the previous`],
      })
    }

    if (newPassword !== newPasswordConfirmation) {
      throw createError(400, 'Bad Request', {
        validation: [
          `The 'new' and 'confirmation' password fields doesn't match`,
        ],
      })
    }

    const inputs = [
      user.id,
      await hashString(newPassword, parseInt(config.SALT_ROUNDS)),
    ]

    const { rowCount } = await db.execQuery(
      'UPDATE users SET password=$2 WHERE id=$1',
      inputs
    )

    if (!rowCount) {
      throw httpErrors.conflict('The action had no effect')
    }

    reply.code(204)
  }
}
