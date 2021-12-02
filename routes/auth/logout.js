import S from 'fluent-json-schema'

import { clearCookie } from '../../lib/cookie.js'

export default async function logout(fastify) {
  const { redis } = fastify

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
        409: fastify.getSchema('sConflict'),
      },
    },
    handler: onLogout,
  })

  async function onLogout(req, reply) {
    const { id } = req.user.session

    const exists = await redis.exists(id)
    if (!exists) {
      throw httpErrors.notFound(`Session with id '${id}' not found`)
    }

    const deleted = await redis.del(id)
    if (!deleted) {
      throw httpErrors.conflict('The action had no effect')
    }

    clearCookie(reply)
    reply.code(204)
  }
}
