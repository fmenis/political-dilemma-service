import S from 'fluent-json-schema'

import { sPermissionResponse } from './lib/schema.js'

export default async function listPermissions(fastify) {
  const { db } = fastify

  fastify.route({
    method: 'POST',
    path: '/list',
    config: {
      public: false,
    },
    schema: {
      summary: 'List permissions',
      description: 'List permissions.',
      response: {
        200: S.object()
          .additionalProperties(false)
          .prop('results', S.array().items(sPermissionResponse())),
      },
    },
    handler: onListPermissions,
  })

  async function onListPermissions() {
    const query = 'SELECT * FROM permissions'
    const res = await db.execQuery(query)
    return { results: res.rows }
  }
}
