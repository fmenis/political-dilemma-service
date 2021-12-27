import Fp from 'fastify-plugin'

async function authorization(fastify) {
  const { httpErrors, pg } = fastify
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

    if (user.isDeleted) {
      log.warn(`Invalid access: user '${user.id}' is deleted`)
      throw createError(403, 'Invalid access', {
        internalCode: '0009',
      })
    }

    const { permission } = reply.context.config
    if (!permission) {
      return
    }

    const userPermissions = await getUserPermissions(user.id, pg)

    if (!userPermissions.includes(permission)) {
      const route = `${req.raw.method} ${req.raw.url}`
      log.warn(
        `Invalid access: permission '${permission}' not found.Route '${route}'`
      )
      throw createError(403, 'Invalid access', {
        internalCode: '0010',
      })
    }

    return
  }

  async function getUserPermissions(userId) {
    const query =
      'SELECT p.resource, p.action, p.ownership FROM permissions_roles ' +
      'AS pr LEFT JOIN permissions AS p ON pr.permission_id = p.id ' +
      'WHERE pr.role_id=ANY(SELECT role_id FROM users_roles WHERE user_id=$1)'

    const { rows } = await pg.execQuery(query, [userId])

    const permissions = rows.map(row => {
      return row.ownership
        ? `${row.resource}:${row.action}:${row.ownership}`
        : `${row.resource}:${row.action}`
    })

    return permissions
  }

  fastify.addHook('onRequest', authorize)
}

export default Fp(authorization)
