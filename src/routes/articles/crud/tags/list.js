import S from 'fluent-json-schema'

import { appConfig } from '../../../../config/main.js'

export default async function listArticleTags(fastify) {
  const { massive } = fastify
  const { inputRexExp } = appConfig

  fastify.route({
    method: 'GET',
    path: '/',
    config: {
      public: false,
    },
    schema: {
      summary: 'List article tags.',
      description: 'Retrieve article tags.',
      querystring: S.object()
        .additionalProperties(false)
        .prop('search', S.string().minLength(3).pattern(inputRexExp))
        .description('Full text search field.'),
      response: {
        200: S.object()
          .additionalProperties(false)
          .prop(
            'results',
            S.array()
              .maxItems(200)
              .items(
                S.object()
                  .additionalProperties(false)
                  .description('Article tags.')
                  .prop('id', S.string().format('uuid'))
                  .description('Tag id.')
                  .required()
                  .prop('name', S.string())
                  .description('Tag name.')
                  .required()
              )
          ),
      },
    },
    handler: onListArticleTags,
  })

  async function onListArticleTags(req) {
    const { search } = req.query
    const options = {
      order: [
        {
          field: 'name',
          direction: 'asc',
        },
      ],
    }

    const tags = search
      ? await massive.tags.where('name ILIKE $1', [`%${search}%`], options)
      : await massive.tags.find({}, options)

    return { results: tags }
  }
}
