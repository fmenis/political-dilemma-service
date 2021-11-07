import S from 'fluent-json-schema'

import { clearCookie } from '../../lib/cookie.js'

export default async function logout(fastify, opts) {
  const { redis } = fastify

  fastify.route({
    method: 'POST',
    path: '/logout',
    config: {
      public: false
    },
    schema: {
      tags: ['auth'],
      summary: 'Logout',
      description: 'Remove user authentication.',
      headers: S.object()
        .additionalProperties(true)
        .prop('Cookie', S.string())
        .description('Autentication header')
        .required(),
      response: {
        204: fastify.getSchema('sNoContent')
      }
    },
    handler: onLogout
  })

  async function onLogout(req, reply) {
    const { id } = req.user

    await redis.del(id)
    clearCookie(reply)
    reply.code(204)
  }
}