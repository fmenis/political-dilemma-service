import S from 'fluent-json-schema'

import { sUserDetail } from './lib/schema.js'

export default async function readUser(fastify) {
  const { pg, httpErrors } = fastify

  fastify.route({
    method: 'GET',
    path: '/:id',
    config: {
      public: false,
      permission: 'user:read',
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
        200: sUserDetail(),
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
      'SELECT u.id, u.first_name, u.last_name, u.user_name, u.email, ' +
      'r.name AS region, p.name AS province, u.bio, u.birth_date, ' +
      'u.joined_date, u.sex, u.is_blocked, u.is_deleted FROM users AS u ' +
      'JOIN regions AS r  ON u.id_region = r.id JOIN provinces AS p ' +
      'ON u.id_province = p.id WHERE u.id = $1'
    const user = await pg.execQuery(query, [id], { findOne: true })
    return user
  }
}
