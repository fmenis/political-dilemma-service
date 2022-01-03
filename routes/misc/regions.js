import S from 'fluent-json-schema'

export default async function listRegions(fastify) {
  const { pg } = fastify

  fastify.route({
    method: 'GET',
    path: '/regions',
    config: {
      public: false,
    },
    schema: {
      summary: 'Italian regions',
      description: 'Get italian regions list.',
      response: {
        200: S.object().prop(
          'results',
          S.array().items(
            S.object()
              .additionalProperties(false)
              .prop('id', S.integer().minimum(1))
              .description('Region id')
              .required()
              .prop('name', S.string().minLength(3))
              .description('Region name')
              .required()
          )
        ),
      },
    },
    handler: onListRegions,
  })

  async function onListRegions() {
    const { rows } = await pg.execQuery('SELECT * FROM regions')
    return { results: rows }
  }
}
