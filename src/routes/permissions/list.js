import S from 'fluent-json-schema'

import { sPermissionResponse } from './lib/schema.js'

export default async function listPermissions(fastify) {
  const { pg } = fastify

  fastify.route({
    method: 'GET',
    path: '',
    config: {
      public: false,
    },
    schema: {
      summary: 'List permissions',
      description: 'List permissions.',
      response: {
        200: S.object()
          .additionalProperties(false)
          .prop(
            'results',
            S.array().maxItems(200).items(sPermissionResponse())
          ),
      },
    },
    handler: onListPermissions,
  })

  async function onListPermissions() {
    const query =
      'SELECT id, resource, action, ownership, description ' +
      'FROM permissions'
    const res = await pg.execQuery(query)
    return { results: res.rows }
  }
}
