import S from 'fluent-json-schema'

import { buildRouteFullDescription } from '../../common/common.js'

export default async function deleteRole(fastify) {
  const { pg, httpErrors } = fastify
  const { errors, throwNotFoundError, throwRoleAssignedError } =
    fastify.roleErrors

  const api = 'delete'
  const permission = `role:${api}`

  fastify.route({
    method: 'DELETE',
    path: '/:id',
    config: {
      public: false,
      permission,
    },
    schema: {
      summary: 'Delete role',
      description: buildRouteFullDescription({
        description: 'Delete role by id.',
        errors,
        permission,
        api,
      }),
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.string().format('uuid'))
        .description('Role id.')
        .required(),
      response: {
        204: fastify.getSchema('sNoContent'),
        404: fastify.getSchema('sNotFound'),
        409: fastify.getSchema('sConflict'),
      },
    },
    preHandler: onPreHandler,
    handler: onDeleteRole,
  })

  async function onPreHandler(req) {
    const { id } = req.params

    const role = await pg.execQuery('SELECT id FROM roles WHERE id=$1', [id], {
      findOne: true,
    })

    if (!role) {
      throwNotFoundError({ id, name: 'role' })
    }

    const { rows } = await pg.execQuery(
      'SELECT user_id, role_id  FROM users_roles WHERE role_id=$1',
      [id]
    )

    if (rows.length) {
      throwRoleAssignedError({ id })
    }
  }

  async function onDeleteRole(req, reply) {
    const { id } = req.params

    const { rowCount } = await pg.execQuery('DELETE FROM roles WHERE id=$1', [
      id,
    ])

    if (!rowCount) {
      throw httpErrors.conflict('The action had no effect')
    }

    reply.code(204)
  }
}
