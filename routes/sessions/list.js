import S from 'fluent-json-schema'

import { sSession } from './lib/schema.js'

export default async function listSessions(fastify) {
  const { redis } = fastify

  fastify.route({
    method: 'GET',
    path: '',
    config: {
      public: false,
    },
    schema: {
      summary: 'List sessions',
      description: 'Retrieve sessions.',
      querystring: S.object()
        .additionalProperties(false)
        .prop('userId', S.string()),
      response: {
        200: S.array().items(sSession()),
      },
    },
    handler: onListSessions,
  })

  async function onListSessions(req) {
    const { userId } = req.query

    const pattern = userId ? `*_${userId}` : '*'

    const keys = await redis.getKeys(pattern)
    if (!keys.length) {
      return []
    }

    const sessions = await redis.getMulti(keys)
    return sessions
  }
}
