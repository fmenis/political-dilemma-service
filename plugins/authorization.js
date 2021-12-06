import Fp from 'fastify-plugin'

async function authorization(fastify) {
  async function authorize(req, reply) {
    if (reply.context.config.public) {
      return
    }

    if (req.user.isBlocked) {
      log.warn(`Invalid access: user '${userId}' is blocked`)
      throw createError(403, 'Invalid access', {
        internalCode: '0002',
      })
    }
  }

  fastify.addHook('onRequest', authorize)
}

export default Fp(authorization)
