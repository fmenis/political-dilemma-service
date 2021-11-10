import S from 'fluent-json-schema'
import { compareStrings, hashString } from '../../lib/hash.js'

export default async function changePassword(fastify) {
  const { db, config, httpErrors } = fastify

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
        .prop('old_pw', S.string().minLength(8))
        .description('Current password')
        .required()
        .prop('new_pw', S.string().minLength(8))
        .description('New password')
        .required()
        .prop('new_pw_confirmation', S.string().minLength(8))
        .description('New password confirmation')
        .required(),
      response: {
        200: fastify.getSchema('sNoContent'),
        409: fastify.getSchema('sConflict')
      }
    },
    handler: onChangePassword
  })

  async function onChangePassword(req, reply) {
    const { old_pw, new_pw, new_pw_confirmation } = req.body
    const { user } = req

    const match = await compareStrings(old_pw, user.password)
    if (!match) {
      throw httpErrors.badRequest(`Old password not valid`)
    }

    if (new_pw === old_pw) {
      throw httpErrors.badRequest(`New password is the same as the previous`)
    }

    if (new_pw !== new_pw_confirmation) {
      throw httpErrors.badRequest(`The 'new' and 'confirmation' password does't match`)
    }

    const inputs = [user.id, await hashString(new_pw, parseInt(config.SALT_ROUNDS))]
    const { rowCount } = await db.execQuery('UPDATE users SET password=$2 WHERE id=$1', inputs)

    if (!rowCount) {
      throw httpErrors.conflict('The action had no effect')
    }
     
    reply.code(204)
  }
}