import S from 'fluent-json-schema'

import { sUserResponse } from './lib/schema.js'

export default async function listUsers(fastify, opts) {
  fastify.route({
    method: 'GET',
    path: '/list',
    schema: {
      tags: ['users'],
      summary: 'User list',
      description: 'Get all users.',
      response: {
        200: S.object()
          .additionalProperties(false)
          .prop('results', S.array().items(sUserResponse()))
      }
    },
    handler: onListUsers
  })

  async function onListUsers(req, reply) {
    const { db } = this

    const users = await execQuery(db)
    return { results: users }
  }

  async function execQuery(db) {
    const query = 'SELECT id, first_name, last_name, user_name, email, bio, is_blocked, created_at, updated_at FROM users'
    const res = await db.execQuery(query)
    return res.rows
  }
}