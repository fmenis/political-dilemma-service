import S from 'fluent-json-schema'

export default async function blockUser(fastify) {
  const { db, httpErrors } = fastify

  fastify.route({
    method: 'POST',
    path: '/block',
    config: {
      public: false,
    },
    schema: {
      summary: 'Block user',
      description: 'Block user.',
      body: S.object()
        .additionalProperties(false)
        .prop('userId', S.integer().minimum(1))
        .description('User id')
        .required()
        .prop('block', S.boolean())
        .description('Define if the user will be blocked or unblocked')
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
    const { userId, block } = req.body
    const { id } = req.user

    if (userId === id) {
      throw httpErrors.conflict(`Cannot block your own user`)
    }

    const user = await db.execQuery(
      'SELECT is_blocked FROM users WHERE id=$1',
      [userId],
      {
        findOne: true,
      }
    )

    if (!user) {
      throw httpErrors.notFound(`User with id '${userId}' not found`)
    }

    if (user.isBlocked === block) {
      throw httpErrors.conflict(`User isBlocked field is already '${block}'`)
    }
  }

  async function onBlockUser(req) {
    const { userId, block } = req.body

    const { rowCount } = await db.execQuery(
      'UPDATE users SET is_blocked=$2 WHERE id=$1',
      [userId, block]
    )

    if (!rowCount) {
      throw httpErrors.conflict('The action had no effect')
    }

    return 'OK'
  }
}
