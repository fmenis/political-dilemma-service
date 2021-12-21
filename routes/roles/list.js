import S from 'fluent-json-schema'

import { sRoleResponse } from './lib/schema.js'

export default async function listPermissions(fastify) {
  const { pg } = fastify

  fastify.route({
    method: 'GET',
    path: '',
    config: {
      public: false,
    },
    schema: {
      summary: 'List roles',
      description: 'List roles.',
      response: {
        200: S.object()
          .additionalProperties(false)
          .prop('results', S.array().items(sRoleResponse())),
      },
    },
    handler: onListPermissions,
  })

  async function onListPermissions() {
    const query = 'SELECT id, name, description FROM roles'
    const res = await pg.execQuery(query)

    /**
     * SELECT roles.id, roles.name, roles.description, permissions.id, 
     * permissions.resource, permissions.action, permissions.ownership
      FROM permissions_roles
      LEFT JOIN roles 
      ON permissions_roles.role_id = roles.id
      LEFT JOIN permissions 
      ON permissions_roles.permission_id = permissions.id
     */

    return { results: res.rows }
  }
}
