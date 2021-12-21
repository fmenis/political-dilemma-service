import S from 'fluent-json-schema'

export default async function deleteSession(fastify) {
  const { redis, httpErrors } = fastify
  const { createError } = httpErrors

  fastify.route({
    method: 'DELETE',
    path: '/:id',
    config: {
      public: false,
    },
    schema: {
      summary: 'Delete session',
      description: 'Delete session by id.',
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.string())
        .description('Session id')
        .required(),
      response: {
        204: fastify.getSchema('sNoContent'),
        404: fastify.getSchema('sNotFound'),
      },
    },
    preHandler: onPrepreHandler,
    handler: onDeleteSession,
  })

  async function onPrepreHandler(req) {
    const { id } = req.params
    const { session } = req.user

    if (session.id === id) {
      throw createError(400, 'Invalid input', {
        validation: [{ message: 'Cannot delete the curreet session' }],
      })
    }
  }

  async function onDeleteSession(req, reply) {
    const { id } = req.params

    const session = await redis.get(id)

    if (!session) {
      throw httpErrors.notFound(`Session with id '${id}' not found`)
    }

    await redis.del(id)

    reply.code(204)
  }
}
