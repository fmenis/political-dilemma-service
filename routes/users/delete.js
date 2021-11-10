import S from 'fluent-json-schema'

export default async function deleteUser(fastify) {
  const { db, httpErrors } = fastify

  fastify.route({
    method: 'DELETE',
    path: '/:id',
    config: {
      public: false,
    },
    schema: {
      summary: 'Delete user',
      description: 'Delete user by id.',
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.integer().minimum(1))
        .description('User id')
        .required(),
      response: {
        204: fastify.getSchema('sNoContent'),
        404: fastify.getSchema('sNotFound'),
        409: fastify.getSchema('sConflict'),
      },
    },
    handler: onDeleteUser,
  })

  async function onDeleteUser(req, reply) {
    const { id } = req.params
    const { user: owner } = req

    const { id: user_id } = await db.findOne(
      'SELECT id FROM users WHERE id=$1',
      [id]
    )
    if (!user_id) {
      throw httpErrors.notFound(`User with id '${id}' not found`)
    }

    if (user_id === owner.id) {
      throw httpErrors.conflict(`Cannot delete your own user`)
    }

    const { rowCount } = await db.execQuery('DELETE users WHERE id=$1', [id])

    if (!rowCount) {
      throw httpErrors.conflict('The action had no effect')
    }

    reply.code(204)
  }
}
