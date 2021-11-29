import S from 'fluent-json-schema'

import { sUserSession } from './lib/schema.js'

export default async function userSessions(fastify) {
  const { db, redis, httpErrors } = fastify

  fastify.route({
    method: 'GET',
    path: '/:id/sessions',
    config: {
      public: false,
    },
    schema: {
      summary: 'List user sessions',
      description: 'Retrieve user sessions.',
      response: {
        200: S.array().items(sUserSession()),
        404: fastify.getSchema('sNotFound'),
      },
    },
    handler: onUserSessions,
  })

  async function onUserSessions(req) {
    const { id } = req.params

    const user = await db.execQuery('SELECT id FROM users WHERE id=$1', [id], {
      findOne: true,
    })
    if (!user) {
      throw httpErrors.notFound(`User with id '${id}' not found`)
    }

    const pattern = `*_${user.id}`
    const keys = await redis.getKeys(pattern)
    if (!keys.length) {
      return []
    }

    const sessions = await redis.getMulti(keys)
    return sessions
  }
}
