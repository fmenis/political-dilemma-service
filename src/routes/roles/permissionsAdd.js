import S from 'fluent-json-schema'
import _ from 'lodash'

import {
  getRole,
  getPermissions,
  associatePermissions,
  getRolePermissions,
} from './lib/utils.js'

export default async function addPermissions(fastify) {
  const { pg, httpErrors } = fastify
  const { createError } = httpErrors

  fastify.route({
    method: 'POST',
    path: '/:id/permissions/add',
    config: {
      public: false,
      permission: 'role:add-permission',
    },
    schema: {
      summary: 'Add permissions',
      description: 'Add permissions to role.',
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.string().format('uuid'))
        .description('Role Id.')
        .required(),
      body: S.object()
        .additionalProperties(false)
        .prop(
          'permissionsIds',
          S.array().items(S.string().format('uuid')).minItems(1)
        )
        .description('Permission ids to be assigned to the roles.')
        .required(),
      response: {
        204: fastify.getSchema('sNoContent'),
      },
    },
    preHandler: onPreHandler,
    handler: onAddPermissions,
  })

  async function onPreHandler(req) {
    const { id } = req.params
    const { permissionsIds } = req.body

    // check role existance
    const role = await getRole(id, pg)
    if (!role) {
      throw httpErrors.notFound(`Role with id '${id}' not found`)
    }

    // check missing permissions
    const permissions = await getPermissions(permissionsIds, pg)
    const ids = permissions.map(item => item.id)

    if (ids.length !== permissionsIds.length) {
      const missing = _.difference(permissionsIds, ids)

      throw createError(400, 'Invalid input', {
        validation: [
          {
            message: `Permissions id ${missing.join(', ')} not found`,
          },
        ],
      })
    }

    // prevent duplicate permissions association
    const rolePermissions = await getRolePermissions(role.id, pg)
    const permissionsAlreadyAssociated = rolePermissions
      .map(item => item.id)
      .reduce((acc, id) => {
        if (permissionsIds.includes(id)) {
          acc.push(id)
        }
        return acc
      }, [])

    if (permissionsAlreadyAssociated.length) {
      throw httpErrors.conflict(
        `Permission/s ${permissionsAlreadyAssociated.join(
          ', '
        )} already associated with role '${role.id}'`
      )
    }
  }

  async function onAddPermissions(req, reply) {
    const { id } = req.params
    const { permissionsIds } = req.body

    let client

    try {
      client = await pg.beginTransaction()
      await associatePermissions(id, permissionsIds, pg, client)
      await pg.commitTransaction(client)

      reply.code(204)
    } catch (error) {
      await pg.rollbackTransaction(client)
      throw error
    }
  }
}
