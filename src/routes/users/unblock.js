import S from 'fluent-json-schema'

export default async function unblockUser(fastify) {
  const { pg, httpErrors } = fastify

  fastify.route({
    method: 'POST',
    path: '/:id/unblock',
    config: {
      public: false,
      permission: 'user:unblock',
    },
    schema: {
      summary: 'Unblock user',
      description: 'Unblock user.',
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.integer().minimum(1))
        .description('User id.')
        .required(),
      response: {
        204: fastify.getSchema('sNoContent'),
        404: fastify.getSchema('sNotFound'),
        409: fastify.getSchema('sConflict'),
      },
    },
    preHandler: preHandler,
    handler: onUnblockUser,
  })

  async function preHandler(req) {
    const { id: userId } = req.params
    const { id } = req.user

    if (userId === id) {
      throw httpErrors.conflict(`Cannot unblock your own user`)
    }

    const user = await pg.execQuery(
      'SELECT is_blocked FROM users WHERE id=$1',
      [userId],
      {
        findOne: true,
      }
    )

    if (!user) {
      throw httpErrors.notFound(`User with id '${userId}' not found`)
    }

    if (!user.isBlocked) {
      throw httpErrors.conflict(`User is already unblocked`)
    }
  }

  async function onUnblockUser(req, reply) {
    const { id } = req.params

    const { rowCount } = await pg.execQuery(
      'UPDATE users SET is_blocked=$2 WHERE id=$1',
      [id, false]
    )

    if (!rowCount) {
      throw httpErrors.conflict('The action had no effect')
    }

    reply.code(204)
  }
}
