import S from 'fluent-json-schema'

import { sSession } from './lib/schema.js'

export default async function listSessions(fastify) {
  const { pg } = fastify

  fastify.route({
    method: 'GET',
    path: '',
    config: {
      public: false,
      permission: 'session:list',
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
    const { session: currentSession } = req.user

    const baseQuery = 'SELECT * FROM sessions'
    const query = userId ? `${baseQuery} WHERE user_id=$1` : baseQuery
    const inputs = userId ? [userId] : []

    const { rows: sessions } = await pg.execQuery(query, inputs)

    // marks current session and places it first
    return sessions
      .map(obj => ({
        ...obj,
        isCurrent: obj.id === currentSession.id,
      }))
      .sort((x, y) => (x.isCurrent === y.isCurrent ? 0 : x.isCurrent ? -1 : 1))
  }
}
