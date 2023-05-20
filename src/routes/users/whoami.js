import S from 'fluent-json-schema'
import { getRawUserPermissions, getUserRoles } from './lib/utils.js'

export default async function userWhoami(fastify) {
  const { pg } = fastify

  fastify.route({
    method: 'GET',
    path: '/whoami',
    config: {
      public: false,
    },
    schema: {
      summary: 'Get authenticated user',
      description: 'Retrieve authenticated user info.',
      response: {
        200: S.object()
          .additionalProperties(false)
          .prop('id', S.string().format('uuid'))
          .description('User id.')
          .required()
          .prop('firstName', S.string().minLength(1).maxLength(50))
          .description('User first name.')
          .required()
          .prop('lastName', S.string().minLength(1).maxLength(50))
          .required()
          .description('User last name.')
          .prop('email', S.string().format('email').minLength(6).maxLength(50))
          .description('User email. It must be unique.')
          .required()
          .prop('roleId', S.string().format('uuid'))
          .description('User role id.')
          .required()
          .prop('permissions', S.array())
          .description('User permissions.')
          .required(),
      },
    },
    handler: onUserWhoami,
  })

  async function onUserWhoami(req) {
    const { user } = req

    const [roles, permissions] = await Promise.all([
      getUserRoles([user.id], pg),
      getRawUserPermissions(user.id, pg),
    ])

    return {
      ...user,
      roleId: roles[0].roleId,
      permissions,
    }
  }
}
