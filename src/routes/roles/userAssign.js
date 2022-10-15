import S from 'fluent-json-schema'

import { getRole, associateRoles, removeUserRole } from './lib/utils.js'

export default async function assignRoles(fastify) {
  const { pg, httpErrors } = fastify
  const { createError } = httpErrors

  fastify.route({
    method: 'POST',
    path: '/assign',
    config: {
      public: false,
      permission: 'role:user-assign',
    },
    schema: {
      summary: 'Assign role',
      description: 'Assign role to a user.',
      body: S.object()
        .additionalProperties(false)
        .prop('userId', S.string().format('uuid'))
        .description('User id.')
        .required()
        .prop('roleId', S.string().format('uuid'))
        .description('Role id to be assigned to the user.')
        .required(),
      response: {
        204: fastify.getSchema('sNoContent'),
        409: fastify.getSchema('sConflict'),
      },
    },
    preHandler: onPreHandler,
    handler: onAssignRoles,
  })

  async function onPreHandler(req) {
    const { userId, roleId } = req.body

    // check user existance
    const user = await pg.execQuery(
      'SELECT id FROM users WHERE id=$1',
      [userId],
      { findOne: true }
    )
    if (!user) {
      throw httpErrors.notFound(`User with id '${userId}' not found`)
    }

    // check missing roles
    const role = await getRole(roleId, pg)
    if (!role) {
      throw createError(400, 'Invalid input', {
        validation: [
          {
            message: `Role id '${roleId}' not found`,
          },
        ],
      })
    }

    const roleAlreadyAssigned = await pg.execQuery(
      'SELECT id FROM users_roles WHERE user_id=$1 AND role_id=$2',
      [userId, roleId],
      { findOne: true }
    )
    if (roleAlreadyAssigned) {
      throw createError(409, 'Conflict', {
        validation: [
          {
            message: `Role id '${roleId}' already assign to user '${userId}'`,
          },
        ],
      })
    }
  }

  async function onAssignRoles(req, reply) {
    const { userId, roleId } = req.body
    const { id: reqUserId } = req.user

    let client

    try {
      client = await pg.beginTransaction()
      await removeUserRole(userId, pg, client)
      await associateRoles(userId, reqUserId, [roleId], pg, client)
      await pg.commitTransaction(client)
      reply.code(204)
    } catch (error) {
      await pg.rollbackTransaction(client)
      throw error
    }
  }
}
