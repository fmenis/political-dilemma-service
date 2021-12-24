import S from 'fluent-json-schema'

export default async function addPermissions(fastify) {
  const { pg /*, httpErrors*/ } = fastify
  // const { createError } = httpErrors

  fastify.route({
    method: 'POST',
    path: '/:id/permissions/remove',
    config: {
      public: false,
    },
    schema: {
      summary: 'Remove permissions',
      description: 'Remove permissions from a role.',
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
     * - permessi NON associati
     */
  }

  async function onAddPermissions(req) {
    const { id } = req.params
    const { permissionsIds } = req.body

    const query =
      'DELETE FROM permissions_roles WHERE permission_id = ANY($2)' +
      ' AND role_id=$1'

    const inputs = [id, permissionsIds]

    await pg.execQuery(query, inputs)
    return 'OK'
  }
}
