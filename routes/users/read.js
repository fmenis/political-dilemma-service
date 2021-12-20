import S from 'fluent-json-schema'

import { sUserResponse } from './lib/schema.js'

export default async function readUser(fastify) {
  const { pg, httpErrors } = fastify

  fastify.route({
    method: 'GET',
    path: '/:id',
    config: {
      public: false,
    },
    schema: {
      summary: 'Get user',
      description: 'Get user by id.',
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.integer().minimum(1))
        .description('User id')
        .required(),
      response: {
        200: sUserResponse(),
        404: fastify.getSchema('sNotFound'),
      },
    },
    handler: onReadUser,
  })

  async function onReadUser(req) {
    const { id } = req.params

    const user = await execQuery(id, pg)
    if (!user) {
      throw httpErrors.notFound(`User with id '${id}' not found`)
    }

    return user
  }

  async function execQuery(id, pg) {
    const query =
      'SELECT id, first_name, last_name, user_name, email, bio, birth_date, ' +
      'joined_date, sex, is_blocked FROM users WHERE id = $1'
    const res = await pg.execQuery(query, [id])
    return res.rows[0]
  }
}
