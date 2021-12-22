import S from 'fluent-json-schema'

export default async function deleteRole(fastify) {
  const { pg, httpErrors } = fastify

  fastify.route({
    method: 'DELETE',
    path: '/:id',
    config: {
      public: false,
    },
    schema: {
      summary: 'Delete role',
      description: 'Delete role by id.',
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.integer().minimum(1))
        .description('Role id')
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
      throw httpErrors.notFound(`Role with id '${id}' not found`)
    }

    //TODO testare quando users_roles è pronta
    const { rows } = await pg.execQuery(
      'SELECT user_id, role_id  FROM users_roles WHERE role_id=$1',
      [id]
    )

    if (rows.length) {
      throw httpErrors.notFound(`Role with id '${id}' is assigned to users`)
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
