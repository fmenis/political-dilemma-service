import S from 'fluent-json-schema'

export default async function addPermissions(fastify) {
  // const { pg, httpErrors } = fastify
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
        .prop('id', S.string())
        .description('Role Id')
        .required(),
      body: S.object()
        .additionalProperties(false)
        .prop('permissionsIds', S.array().items([S.number()]).minItems(1))
        .description('Permission ids to be assigned to the roles')
        .required(),
      response: {
        204: fastify.getSchema('sNoContent'),
      },
    },
    preHandler: onPreHandler,
    handler: onAddPermissions,
  })

  async function onPreHandler() {
    //TODO
  }

  async function onAddPermissions() {
    //TODO
  }
}
