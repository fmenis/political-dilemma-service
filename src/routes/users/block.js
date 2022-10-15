import S from 'fluent-json-schema'

export default async function blockUser(fastify) {
  const { pg, httpErrors } = fastify

  fastify.route({
    method: 'POST',
    path: '/:id/block',
    config: {
      public: false,
      permission: 'user:block',
    },
    schema: {
      summary: 'Block user',
      description: 'Block user.',
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.string().format('uuid'))
        .description('User id.')
        .required(),
      response: {
        204: fastify.getSchema('sNoContent'),
        404: fastify.getSchema('sNotFound'),
        409: fastify.getSchema('sConflict'),
      },
    },
    preHandler: preHandler,
    handler: onBlockUser,
  })

  async function preHandler(req) {
    const { id: userId } = req.params
    const { id } = req.user

    if (userId === id) {
      throw httpErrors.conflict(`Cannot block your own user`)
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

    if (user.isBlocked) {
      throw httpErrors.conflict(`User is already blocked`)
    }
  }

  async function onBlockUser(req, reply) {
    const { id } = req.params

    const { rowCount } = await pg.execQuery(
      'UPDATE users SET is_blocked=$2 WHERE id=$1',
      [id, true]
    )

    if (!rowCount) {
      throw httpErrors.conflict('The action had no effect')
    }

    reply.code(204)
  }
}
