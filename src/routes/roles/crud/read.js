import S from 'fluent-json-schema'

import { sRoleResponse } from '../lib/schema.js'
import { getRole, getRolePermissions } from '../lib/utils.js'

export default async function readRole(fastify) {
  const { pg, httpErrors } = fastify

  fastify.route({
    method: 'GET',
    path: '/:id',
    config: {
      public: false,
      permission: 'role:read',
    },
    schema: {
      summary: 'Get role',
      description: 'Get role by id.',
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.integer().minimum(1))
        .description('Role id.')
        .required(),
      response: {
        200: sRoleResponse(),
        404: fastify.getSchema('sNotFound'),
      },
    },
    handler: onReadRole,
  })

  async function onReadRole(req) {
    const { id: roleId } = req.params

    // check role existance
    const role = await getRole(roleId, pg)
    if (!role) {
      throw httpErrors.notFound(`Role with id '${roleId}' not found`)
    }

    role.permissions = await getRolePermissions(roleId, pg)

    return role
  }
}
