import S from 'fluent-json-schema'

export default async function deletePermission(fastify) {
  const { pg, httpErrors } = fastify

  fastify.route({
    method: 'DELETE',
    path: '/:id',
    config: {
      public: false,
    },
    schema: {
      summary: 'Delete permission',
      description: 'Delete permission by id.',
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.integer().minimum(1))
        .description('Permission id')
        .required(),
      response: {
        204: fastify.getSchema('sNoContent'),
        404: fastify.getSchema('sNotFound'),
        409: fastify.getSchema('sConflict'),
      },
    },
    preHandler: onPreHandler,
    handler: onDeletePermission,
  })

  async function onPreHandler(req) {
    const { id } = req.params

    const permission = await pg.execQuery(
      'SELECT id FROM permissions WHERE id=$1',
      [id],
      { findOne: true }
    )
    if (!permission) {
      throw httpErrors.notFound(`Permission with id '${id}' not found`)
    }

    //TODO testare
    const assignToRole = await pg.execQuery(
      'SELECT role_id FROM permissions_roles WHERE role_id=$1',
      [id],
      { findOne: true }
    )
    if (assignToRole) {
      throw httpErrors.conflict(
        `Cannot delete permission with id '${id}', its assigned to a role`
      )
    }
  }

  async function onDeletePermission(req, reply) {
    const { id } = req.params

    const { rowCount } = await pg.execQuery(
      'DELETE FROM permissions WHERE id=$1',
      [id]
    )

    if (!rowCount) {
      throw httpErrors.conflict('The action had no effect')
    }

    reply.code(204)
  }
}
