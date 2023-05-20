import Fp from 'fastify-plugin'
import { getRawUserPermissions } from '../routes/users/lib/utils.js'

async function authorization(fastify) {
  const { httpErrors, pg } = fastify
  const { createError } = httpErrors

  async function authorize(req, reply) {
    const { log, user } = req
    const { permission } = reply.context.config

    if (reply.context.config.public) {
      return
    }

    if (user.isBlocked) {
      log.warn(`Invalid access: user '${user.id}' is blocked`)
      throw createError(403, 'Invalid access', {
        internalCode: '0002',
      })
    }

    if (user.isDeleted) {
      log.warn(`Invalid access: user '${user.id}' is deleted`)
      throw createError(403, 'Invalid access', {
        internalCode: '0009',
      })
    }

    if (!permission) {
      return
    }

    const userPermissions = await getRawUserPermissions(user.id, pg)

    const userApiPermission = userPermissions.find(item =>
      item.includes(permission)
    )

    if (!userApiPermission) {
      const route = `${req.raw.method} ${req.raw.url}`
      log.warn(
        `Invalid access: permission '${permission}' not found. Route '${route}'`
      )
      throw createError(403, 'Invalid access', {
        internalCode: '0010',
      })
    }

    user.apiPermission = userApiPermission
  }

  fastify.addHook('onRequest', authorize)
}

export default Fp(authorization)
