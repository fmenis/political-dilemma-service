import S from 'fluent-json-schema'

export default async function deleteSession(fastify) {
  const { redis, httpErrors } = fastify
  const { createError } = httpErrors

  fastify.route({
    method: 'DELETE',
    path: '',
    config: {
      public: false,
    },
    schema: {
      summary: 'Delete sessions',
      description: 'Delete sessions by ids (bulk deletion).',
      querystring: S.object()
        .additionalProperties(false)
        .prop('ids', S.array())
        .description('Session ids')
        .required(),
      response: {
        204: fastify.getSchema('sNoContent'),
      },
    },
    preValidation: async function (req) {
      req.query.ids = req.query.ids.split(',')
    },
    preHandler: onPrepreHandler,
    handler: onDeleteSession,
  })

  async function onPrepreHandler(req) {
    const { ids } = req.query
    const { session } = req.user

    if (ids.includes(session.id)) {
      throw createError(400, 'Invalid input', {
        validation: [
          { message: `Cannot delete the current session '${session.id}'` },
        ],
      })
    }

    const sessions = await redis.getMulti(ids)
    if (sessions.length !== ids.length) {
      const difference = ids
        .filter(id => !sessions.some(obj => obj.id === id))
        .join(', ')

      throw createError(400, 'Invalid input', {
        validation: [{ message: `Cannot find sessions '${difference}'` }],
      })
    }
  }

  async function onDeleteSession(req, reply) {
    const { ids } = req.query
    await redis.del(ids)
    reply.code(204)
  }
}
