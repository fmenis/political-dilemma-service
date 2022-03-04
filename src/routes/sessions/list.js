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
        .prop('userId', S.number().minimum(1))
        .description('Retrieve user sessions')
        .prop('active', S.boolean())
        .description('Retrieve only active sessions'),
      response: {
        200: S.array().items(sSession()),
      },
    },
    handler: onListSessions,
  })

  async function onListSessions(req) {
    const { userId, active } = req.query
    const { session: currentSession } = req.user

    let query = 'SELECT * FROM sessions'
    const inputs = []

    if (userId) {
      inputs.push(userId)
      query += ` WHERE user_id=$1`
    }

    if (active) {
      inputs.push(new Date())
      query += ` AND expired_at > $2`
    }

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
