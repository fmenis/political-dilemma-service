import S from 'fluent-json-schema'

import { deleteSessions } from '../sessions/lib/utils.js'

export default async function logout(fastify) {
  const { pg, httpErrors } = fastify

  fastify.route({
    method: 'POST',
    path: '/logout',
    config: {
      public: false,
    },
    schema: {
      summary: 'Logout',
      description: 'Remove user authentication.',
      headers: S.object()
        .additionalProperties(true)
        .prop('Cookie', S.string())
        .description('Authentication cookie header')
        .required(),
      response: {
        204: fastify.getSchema('sNoContent'),
        404: fastify.getSchema('sNotFound'),
      },
    },
    handler: onLogout,
  })

  async function onLogout(req, reply) {
    const { id: sessionId } = await pg.execQuery(
      'SELECT id FROM sessions WHERE id=$1',
      [req.user.session.id],
      { findOne: true }
    )

    if (!sessionId) {
      throw httpErrors.notFound(`Session with id '${sessionId}' not found`)
    }

    await deleteSessions([sessionId], pg)

    reply.code(204)
    reply.clearCookie('session', { path: '/api' })
  }
}
