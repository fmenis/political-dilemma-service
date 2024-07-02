import S from 'fluent-json-schema'
import _ from 'lodash'

import { getRole, getPermissions, getRolePermissions } from './lib/utils.js'

export default async function removePermissions(fastify) {
  const { pg, httpErrors } = fastify
  const { createError } = httpErrors

  fastify.route({
    method: 'POST',
    path: '/:id/permissions/remove',
    config: {
      public: false,
      permission: 'role:remove-permission',
    },
    schema: {
      summary: 'Remove permissions',
      description: 'Remove permissions from a role.',
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.string().format('uuid'))
        .description('Role Id.')
        .required(),
      body: S.object()
        .additionalProperties(false)
        .prop(
          'permissionsIds',
          S.array().items(S.string().format('uuid')).minItems(1)
        )
        .description('Permission ids to be assigned to the roles.')
        .required(),
      response: {
        204: fastify.getSchema('sNoContent'),
        409: fastify.getSchema('sConflict'),
      },
    },
    preHandler: onPreHandler,
    handler: onRemovePermissions,
  })

  async function onPreHandler(req) {
    const { id: roleId } = req.params
    const { permissionsIds } = req.body

    // check role existence
    const role = await getRole(roleId, pg)
    if (!role) {
      throw httpErrors.notFound(`Role with id '${roleId}' not found`)
    }

    // check missing permissions
    const permissions = await getPermissions(permissionsIds, pg)
    const ids = permissions.map(item => item.id)

    if (ids.length !== permissionsIds.length) {
      const missing = _.difference(permissionsIds, ids)

      throw createError(400, 'Invalid input', {
        validation: [
          {
            message: `Permissions id ${missing.join(', ')} not found`,
          },
        ],
      })
    }

    // prevent all permission deletion (or the last one)
    const rolePermissions = await getRolePermissions(roleId, pg)
    if (permissionsIds.length >= rolePermissions.length) {
      throw httpErrors.conflict(
        `Cannot delete all permissions inside role '${roleId}'`
      )
    }
  }

  async function onRemovePermissions(req, reply) {
    const { id } = req.params
    const { permissionsIds } = req.body

    const query =
      'DELETE FROM permissions_roles WHERE permission_id = ANY($2)' +
      ' AND role_id=$1'

    const inputs = [id, permissionsIds]

    await pg.execQuery(query, inputs)
    reply.code(204)
  }
}
