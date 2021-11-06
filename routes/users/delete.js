import S from 'fluent-json-schema'

import { sNoContent, sUnauthorized, sForbidden, sNotFound } from '../lib/errorSchemas.js'

export default async function deleteUser(fastify, opts) {
  fastify.route({
    method: 'DELETE',
    path: '/:id',
    schema: {
      tags: ['users'],
      summary: 'Delete user',
      description: 'Delete user by id.',
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.integer().minimum(1))
        .description('User id')
        .required(),
      response: {
        204: sNoContent(),
        401: sUnauthorized(),
        403: sForbidden(),
        404: sNotFound()
      }
    },
    handler: onDeleteUser
  })

  async function onDeleteUser(req, reply) {
    const { db, httpErrors } = this
    const { id } = req.params

    const rowCont = await execQuery(id, db)
    if (!rowCont) {
      throw httpErrors.notFound(`User with id '${id}' not found`)
    }

    reply.code(204)
  }

  async function execQuery(id, db) {
    const query = 'DELETE FROM users WHERE id = $1'
    const res = await db.execQuery(query, [id])
    return res.rowCount
  }
}