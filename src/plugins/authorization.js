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
    const matchPermission = userPermissions.includes(permission)

    if (!matchPermission) {
      const route = `${req.raw.method} ${req.raw.url}`
      log.warn(
        `Invalid access: permission '${permission}' not found. Route '${route}'`
      )
      throw createError(403, 'Invalid access', {
        internalCode: '0010',
      })
    }

    user.permissions = userPermissions

    return

    //TODO
    // if (permission.includes('own')) {
    //   const resourceId = req.params.id
    //   const table = matchPermission.split(':')[0]
    //   const resource = await pg.execQuery(
    //     `SELECT owner_id FROM ${table} WHERE id=$1`,
    //     [resourceId],
    //     { findOne: true }
    //   )

    //   if (resource.ownerId !== user.id) {
    //     log.warn(
    //       `Invalid access '${permission}' not found.Route '${route}'`
    //     )
    //     throw createError(403, 'Invalid access', {
    //       internalCode: '0010',
    //     })
    //   }
    // }
  }

  fastify.addHook('onRequest', authorize)
}

export default Fp(authorization)
