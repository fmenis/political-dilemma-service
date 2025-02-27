import S from 'fluent-json-schema'

import { sRoleResponse } from '../lib/schema.js'
import { getRolePermissions, associatePermissions } from '../lib/utils.js'
import { findArrayDuplicates } from '../../../utils/main.js'

export default async function updateRole(fastify) {
  const { pg, httpErrors } = fastify
  const { createError } = httpErrors

  fastify.route({
    method: 'PUT',
    path: '/:id',
    config: {
      public: false,
      permission: 'role:update',
    },
    schema: {
      summary: 'Update role',
      description: 'Update role by id.',
      parmas: S.object()
        .additionalProperties(false)
        .prop('id', S.string().format('uuid'))
        .description('Role id.')
        .required(),
      body: S.object()
        .additionalProperties(false)
        .prop('name', S.string().minLength(3).maxLength(50))
        .description('Role name.')
        .required()
        .prop('description', S.string().minLength(3).maxLength(200))
        .description('Role description.')
        .required()
        .prop(
          'permissionsIds',
          S.array().items(S.string().format('uuid')).minItems(1)
        )
        .description('Role permissions ids.'),
      response: {
        200: sRoleResponse(),
        404: fastify.getSchema('sNotFound'),
        409: fastify.getSchema('sConflict'),
      },
    },
    preHandler: onPreHandler,
    handler: onUpdateRole,
  })

  async function onPreHandler(req) {
    const { id } = req.params
    const { permissionsIds } = req.body

    const role = await pg.execQuery('SELECT id FROM roles WHERE id=$1', [id], {
      findOne: true,
    })

    if (!role) {
      throw httpErrors.notFound(`Role with id '${id}' not found`)
    }

    // only a permission per modificator (own / any) cab be specified
    if (permissionsIds?.length) {
      const { rows: permissions } = await pg.execQuery(
        'SELECT resource, action  FROM permissions WHERE id= ANY ($1)',
        [permissionsIds]
      )

      const duplicatedPermission = findArrayDuplicates(
        permissions.map(item => `${item.resource}-${item.action}`)
      )
      if (duplicatedPermission.length) {
        throw createError(400, 'Invalid input', {
          internalCode: 'DUPLICATED_OWNERSHIP',
          validation: [
            {
              message: `A permission cannot be assign with both ownerships (any and own): ${duplicatedPermission.join(
                ', '
              )}`,
            },
          ],
        })
      }
    }
  }

  async function onUpdateRole(req) {
    const { id } = req.params
    const { name, description, permissionsIds } = req.body

    let client

    try {
      client = await pg.beginTransaction()

      const query =
        'UPDATE roles SET name=$2, description=$3 WHERE id=$1' +
        'RETURNING id, name, description, is_active'

      const { rowCount, rows } = await pg.execQuery(
        query,
        [id, name, description],
        { client }
      )

      if (!rowCount) {
        throw httpErrors.conflict('The action had no effect')
      }

      if (permissionsIds?.length) {
        // delete all role permissions
        await pg.execQuery(
          'DELETE FROM permissions_roles WHERE role_id=$1',
          [id],
          { client }
        )

        // re-assign all permissions
        await associatePermissions(id, permissionsIds, pg, client)
      }

      await pg.commitTransaction(client)

      const role = rows[0]
      role.permissions = await getRolePermissions(id, pg)

      return rows[0]
    } catch (error) {
      await pg.rollbackTransaction(client)
      throw error
    }
  }
}
