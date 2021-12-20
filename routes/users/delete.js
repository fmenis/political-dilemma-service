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
    preHandler: async function (req) {
      const { id } = req.params
      const { user: owner } = req

      const user = await db.execQuery(
        'SELECT id FROM users WHERE id=$1',
        [id],
        {
          findOne: true,
        }
      )

      if (!user) {
        throw httpErrors.notFound(`User with id '${id}' not found`)
      }

      if (user.id === owner.id) {
        throw httpErrors.conflict(`Cannot delete your own user`)
      }
    },
    handler: onDeleteUser,
  })

  async function onDeleteUser(req, reply) {
    const { id } = req.params

    const query = 'UPDATE users SET is_deleted=true WHERE id=$1'
    const { rowCount } = await db.execQuery(query, [id])

    if (!rowCount) {
      throw httpErrors.conflict('The action had no effect')
    }

    reply.code(204)
  }
}
