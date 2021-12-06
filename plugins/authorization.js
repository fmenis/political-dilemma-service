import Fp from 'fastify-plugin'

async function authorization(fastify) {
  const { httpErrors } = fastify
  const { createError } = httpErrors

  async function authorize(req, reply) {
    const { log, user } = req

    if (reply.context.config.public) {
      return
    }

    if (user.isBlocked) {
      log.warn(`Invalid access: user '${user.id}' is blocked`)
      throw createError(403, 'Invalid access', {
        internalCode: '0002',
      })
    }
  }

  fastify.addHook('onRequest', authorize)
}

export default Fp(authorization)
