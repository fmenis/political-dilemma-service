import S from 'fluent-json-schema'

export default async function listArticleTags(fastify) {
  const { massive } = fastify

  fastify.route({
    method: 'GET',
    path: '/',
    config: {
      public: false,
    },
    schema: {
      summary: 'List article tags.',
      description: 'Retrieve article tags.',
      response: {
        200: S.array().items(
          S.object()
            .additionalProperties(false)
            .description('Article tags.')
            .prop('id', S.string().format('uuid'))
            .description('Tag id.')
            .required()
            .prop('name', S.string())
            .description('Tag name.')
            .required()
        ),
      },
    },
    handler: onListArticleTags,
  })

  async function onListArticleTags() {
    return massive.tags.find()
  }
}
