import S from 'fluent-json-schema'
import _ from 'lodash'

import { getRoles } from './lib/utils.js'

export default async function removeRoles(fastify) {
  const { pg, httpErrors } = fastify
  const { createError } = httpErrors

  fastify.route({
    method: 'POST',
    path: '/remove',
    config: {
      public: false,
      permission: 'role:user-remove',
    },
    schema: {
      summary: 'Remove roles',
      description: 'Remove roles from a user.',
      body: S.object()
        .additionalProperties(false)
        .prop('userId', S.number())
        .description('TODO')
        .required()
        .prop('rolesIds', S.array().items([S.number()]).minItems(1))
        .description('Role ids to be removed from the user')
        .required(),
      response: {
        204: fastify.getSchema('sNoContent'),
      },
    },
    preHandler: onPreHandler,
    handler: onRemoveRoles,
  })

  async function onPreHandler(req) {
    const { userId, rolesIds } = req.body

    // check user existance
    const user = await pg.execQuery(
      'SELECT id FROM users WHERE id=$1',
      [userId],
      { findOne: true }
    )

    if (!user) {
      throw httpErrors.notFound(`User with id '${userId}' not found`)
    }

    // check duplicated roles
    const duplicates = rolesIds.reduce((acc, id, index, array) => {
      if (array.indexOf(id) !== index && !acc.includes(id)) {
        acc.push(id)
      }
      return acc
    }, [])

    if (duplicates.length) {
      throw createError(400, 'Invalid input', {
        validation: [
          {
            message: `Duplicate roles ids: ${duplicates.join(', ')}`,
          },
        ],
      })
    }

    // check missing roles
    const roles = await getRoles(rolesIds, pg)
    const ids = roles.map(item => item.id)

    if (ids.length !== roles.length) {
      const missing = _.difference(roles, ids)

      throw createError(400, 'Invalid input', {
        validation: [
          {
            message: `Permissions id ${missing.join(', ')} not found`,
          },
        ],
      })
    }

    //TODO controllare che uno dei ruoli non sia stato già assegnato
  }

  async function onRemoveRoles(req, reply) {
    const { userId, rolesIds } = req.body

    let client

    try {
      client = await pg.beginTransaction()

      await removeRoles(userId, rolesIds, client)

      await pg.commitTransaction(client)
      reply.code(204)
    } catch (error) {
      await pg.rollbackTransaction(client)
      throw error
    }
  }

  async function removeRoles(userId, rolesIds, client) {
    const query =
      'DELETE FROM users_roles WHERE role_id = ANY($2) AND user_id=$1'
    return pg.execQuery(query, [userId, rolesIds], {
      client,
    })
  }
}
