import S from 'fluent-json-schema'
import _ from 'lodash'

import { getRoles, associateRoles } from './lib/utils.js'

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
      hide: true,
      summary: 'Assign roles',
      description: 'Assign roles to a user.',
      body: S.object()
        .additionalProperties(false)
        .prop('userId', S.number())
        .description('User id')
        .required()
        .prop('rolesIds', S.array().items(S.number()).minItems(1))
        .description('Role ids to be assigned to the user')
        .required(),
      response: {
        204: fastify.getSchema('sNoContent'),
      },
    },
    preHandler: onPreHandler,
    handler: onAssignRoles,
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
    if (!roles.length) {
      throw createError(400, 'Invalid input', {
        validation: [
          {
            message: `Roles ids ${rolesIds.join(', ')} not found`,
          },
        ],
      })
    }

    if (roles.length < rolesIds.length) {
      const missing = _.difference(
        rolesIds,
        roles.map(item => item.id)
      )
      throw createError(400, 'Invalid input', {
        validation: [
          {
            message: `Roles ids ${missing.join(', ')} not found`,
          },
        ],
      })
    }

    //TODO controllare che uno dei ruoli non sia stato già assegnato
  }

  async function onAssignRoles(req, reply) {
    const { userId, rolesIds } = req.body
    const { id: reqUserId } = req.user

    let client

    try {
      client = await pg.beginTransaction()
      await associateRoles(userId, reqUserId, rolesIds, pg, client)
      await pg.commitTransaction(client)
      reply.code(204)
    } catch (error) {
      await pg.rollbackTransaction(client)
      throw error
    }
  }
}
