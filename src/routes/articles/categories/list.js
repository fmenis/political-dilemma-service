import S from 'fluent-json-schema'

export default async function listArticleCategories(fastify) {
  const { massive } = fastify

  fastify.route({
    method: 'GET',
    path: '/',
    config: {
      public: false,
      permission: 'article-category:list',
    },
    schema: {
      summary: 'List article categories.',
      description: 'Retrieve article categories.',
      response: {
        200: S.array().items(
          S.object()
            .additionalProperties(false)
            .description('Article categories.')
            .prop('id', S.string().format('uuid'))
            .description('Category id.')
            .required()
            .prop('name', S.string())
            .description('Category name.')
            .required()
        ),
      },
    },
    handler: onListArticleCategories,
  })

  async function onListArticleCategories() {
    return massive.articleCategories.find()
  }
}
