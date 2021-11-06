export function clearCookie(reply) {
  reply.clearCookie('session', { path: '/api' })
}