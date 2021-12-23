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
    const query =
      'SELECT roles.id AS role_id, roles.name, roles.description, ' +
      'roles.is_active, pr.id AS permission_id, pr.resource, pr.action, ' +
      'pr.ownership, pr.description AS permdesc FROM permissions_roles ' +
      'LEFT JOIN roles ON permissions_roles.role_id = roles.id ' +
      'LEFT JOIN permissions AS pr ON permissions_roles.permission_id = pr.id'

    const { rows } = await pg.execQuery(query)

    const groupRolesPermissions = rows.reduce((acc, item, index, array) => {
      const rolePermissions = array.filter(obj => obj.roleId === item.roleId)

      if (!acc.some(obj => obj.id === item.roleId)) {
        acc.push({
          id: item.roleId,
          name: item.name,
          description: item.description,
          isActive: item.isActive,
          permissions: rolePermissions.map(obj => ({
            id: obj.permissionId,
            resource: obj.resource,
            action: obj.action,
            ownership: obj.ownership,
            description: obj.permdesc,
          })),
        })
      }
      return acc
    }, [])

    return { results: groupRolesPermissions }
  }
}
