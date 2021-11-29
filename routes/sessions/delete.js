import S from 'fluent-json-schema'

export default async function deleteSession(fastify) {
  const { redis, httpErrors } = fastify

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
    handler: onDeleteSession,
  })

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
