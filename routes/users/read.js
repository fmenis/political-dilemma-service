import S from 'fluent-json-schema'

export default async function health(fastify, opts) {
  fastify.route({
    method: 'POST',
    path: '/users/:id',
    schema: {
      description: 'Returns user',
			tags: ['user', 'read'],
			summary: 'read',
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.integer().minimum(1))
        .required(),
      response: S.object()
    },
    handler: onRetrieve
  })

  async function onRetrieve(req, reply) {
    const { pg, httpErrors, log } = this
    const { id } = params

    const user = await pg.users.findOne(id)
    if (!user) {
      log.vebose(`User '${id}' not found`)
      throw httpErrors.notFound(`User '${id}' not found`)
    }

    return user
  }
}