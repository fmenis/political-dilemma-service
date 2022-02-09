import S from 'fluent-json-schema'
import { getRawUserPermissions } from './lib/utils.js'

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
          .prop('id', S.number())
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
          .prop('permissions', S.array())
          .description('User permissions.')
          .required(),
      },
    },
    handler: onUserWhoami,
  })

  async function onUserWhoami(req) {
    const { id } = req.user

    const query =
      'SELECT id, first_name, last_name, email FROM users WHERE id=$1'

    const [user, permissions] = await Promise.all([
      pg.execQuery(query, [id], { findOne: true }),
      getRawUserPermissions(id, pg),
    ])

    return {
      ...user,
      permissions,
    }
  }
}
