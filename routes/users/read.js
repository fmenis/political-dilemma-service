import S from 'fluent-json-schema'
import { sUserResponse } from './lib/schema.js'

export default async function readUser(fastify, opts) {
  fastify.route({
    method: 'GET',
    path: '/:id',
    schema: {
      tags: ['users'],
      summary: 'Get user',
      description: 'Get user by id.',
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.integer().minimum(1))
        .description('User id')
        .required(),
      response: {
        200: sUserResponse()
      }
    },
    handler: onReadUser
  })

  async function onReadUser(req, reply) {
    const { db, httpErrors } = this
    const { id } = req.params

    const user = await execQuery(id, db)
    if (!user) {
      throw httpErrors.notFound(`User '${id}' not found`)
    }

    return user
  }

  async function execQuery(id, db) {
    const query = 'SELECT * FROM users WHERE id = $1'
    const res = await db.execQuery(query, [id])
    return res.rows[0];
  }
}