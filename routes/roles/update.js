import S from 'fluent-json-schema'

import { sRoleResponse } from './lib/schema.js'
import { getRolePermissions } from './lib/utils.js'

export default async function updateRole(fastify) {
  const { pg, httpErrors } = fastify

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
        .prop('id', S.number().minimum(1))
        .description('Role id')
        .required(),
      body: S.object()
        .additionalProperties(false)
        .prop('name', S.string().minLength(3).maxLength(50))
        .description('Role name')
        .required()
        .prop('description', S.string().minLength(3).maxLength(200))
        .description('Role description')
        .required(),
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

    const role = await pg.execQuery('SELECT id FROM roles WHERE id=$1', [id], {
      findOne: true,
    })

    if (!role) {
      throw httpErrors.notFound(`Role with id '${id}' not found`)
    }
  }

  async function onUpdateRole(req) {
    const { id } = req.params
    const { name, description } = req.body

    const query =
      'UPDATE roles SET name=$2, description=$3 WHERE id=$1' +
      'RETURNING id, name, description, is_active'

    const { rowCount, rows } = await pg.execQuery(query, [
      id,
      name,
      description,
    ])

    if (!rowCount) {
      throw httpErrors.conflict('The action had no effect')
    }

    const role = rows[0]
    role.permissions = await getRolePermissions(id, pg)

    return rows[0]
  }
}
