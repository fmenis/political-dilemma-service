import S from 'fluent-json-schema'

export default async function listRegions(fastify) {
  const { pg, httpErrors } = fastify

  fastify.route({
    method: 'GET',
    path: '/provinces',
    config: {
      public: false,
      permission: 'provinces:list',
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
      const region = await pg.execQuery(
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

    const baseQuery =
      'SELECT p.id, p.name, p.code FROM provinces AS p ' +
      'JOIN regions AS r ON p.id_region = r.id '

    let query = regionId ? `${baseQuery} WHERE id_region=$1` : baseQuery
    query += ' ORDER BY p.name ASC'

    const promise = regionId
      ? pg.execQuery(query, [regionId])
      : pg.execQuery(query)

    const { rows } = await promise
    return { results: rows }
  }
}
