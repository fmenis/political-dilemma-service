import S from 'fluent-json-schema'

import { associatePermissions } from './lib/utils.js'

export default async function addPermissions(fastify) {
  const { pg /*, httpErrors*/ } = fastify
  // const { createError } = httpErrors

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
        .prop('id', S.number().minimum(1))
        .description('Role Id')
        .required(),
      body: S.object()
        .additionalProperties(false)
        .prop('permissionsIds', S.array().items([S.number()]).minItems(1))
        .description('Permission ids to be assigned to the roles')
        .required(),
      response: {
        // 204: fastify.getSchema('sNoContent'), TODO
      },
    },
    preHandler: onPreHandler,
    handler: onAddPermissions,
  })

  async function onPreHandler() {
    /**
     * Controllare:
     * - esistenza ruolo
     * - esistenza permessi
     * - permessi già associati
     */
  }

  async function onAddPermissions(req) {
    const { id } = req.params
    const { permissionsIds } = req.body

    let client

    try {
      client = await pg.beginTransaction()

      await associatePermissions(id, permissionsIds, pg, client)

      await pg.commitTransaction(client)

      return 'OK'
    } catch (error) {
      await pg.rollbackTransaction(client)
      throw error
    }
  }
}
