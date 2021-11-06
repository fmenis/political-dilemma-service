import { clearCookie } from '../../lib/cookie.js'

export default async function logout(fastify, opts) {
  fastify.route({
    method: 'POST',
    path: '/logout',
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