import S from 'fluent-json-schema'

import { clearCookie } from '../../lib/cookie.js'
import { sNoContent, sUnauthorized, sForbidden } from '../lib/errorSchemas.js'

export default async function logout(fastify, opts) {
  fastify.route({
    method: 'POST',
    path: '/logout',
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
        204: sNoContent(),
        401: sUnauthorized(),
        403: sForbidden()
      }
    },
    handler: onLogout
  })

  async function onLogout(req, reply) {
    const { redis } = this
    const { id } = req.user

    await redis.del(id)
    clearCookie(reply)
    reply.code(204)
  }
}