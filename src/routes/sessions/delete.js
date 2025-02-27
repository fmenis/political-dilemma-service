import S from 'fluent-json-schema'

import { deleteSessions } from './lib/utils.js'

export default async function deleteSession(fastify) {
  const { pg, httpErrors } = fastify
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
      body: S.object()
        .additionalProperties(false)
        .prop(
          'ids',
          S.array()
            .items(S.string().format('uuid'))
            .minItems(1)
            .uniqueItems(true)
        )
        .description('Session ids.')
        .required(),
      response: {
        204: fastify.getSchema('sNoContent'),
      },
    },
    preHandler: onPreHandler,
    handler: onDeleteSession,
  })

  async function onPreHandler(req) {
    const { ids } = req.body
    const { session } = req.user

    if (ids.includes(session.id)) {
      throw createError(400, 'Invalid input', {
        validation: [
          { message: `Cannot delete the current session '${session.id}'` },
        ],
      })
    }

    const { rows: sessions } = await pg.execQuery(
      'SELECT * FROM sessions WHERE id=ANY($1)',
      [ids]
    )

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
    const { ids } = req.body
    await deleteSessions(ids, pg)
    reply.code(204)
  }
}
