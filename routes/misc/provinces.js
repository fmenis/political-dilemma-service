import S from 'fluent-json-schema'

export default async function listRegions(fastify) {
  const { db, httpErrors } = fastify

  fastify.route({
    method: 'GET',
    path: '/provinces',
    config: {
      public: false,
    },
    schema: {
      summary: 'Italian provinces',
      description: 'Get italian provinces list.',
      querystring: S.object()
        .additionalProperties(false)
        .prop('regionId', S.integer().minimum(1))
        .description('Region id'),
      response: {
        200: S.object().prop(
          'results',
          S.array().items(
            S.object()
              .additionalProperties(false)
              .prop('id', S.integer().minimum(1))
              .description('Province id')
              .required()
              .prop('name', S.string().minLength(3))
              .description('Province name')
              .required()
              .prop('code', S.string().minLength(2).maxLength(2))
              .description('Province name')
              .required()
          )
        ),
        404: fastify.getSchema('sNotFound'),
      },
    },
    preHandler: onPreHandler,
    handler: onListRegions,
  })

  async function onPreHandler(req) {
    const { regionId } = req.query

    if (regionId) {
      const region = await db.execQuery(
        'SELECT name FROM regions WHERE id=$1',
        [regionId],
        { findOne: true }
      )

      if (!region) {
        throw httpErrors.notFound(`Region with id '${regionId}' not found`)
      }
    }
  }

  async function onListRegions(req) {
    const { regionId } = req.query

    const baseQuery = 'SELECT id, name, code FROM provinces'
    const query = regionId ? `${baseQuery} WHERE id_region=$1` : baseQuery

    const promise = regionId
      ? db.execQuery(query, [regionId])
      : db.execQuery(query)

    const { rows } = await promise
    return { results: rows }
  }
}
