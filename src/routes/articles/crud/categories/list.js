import S from 'fluent-json-schema'

export default async function listArticleCategories(fastify) {
  const { massive } = fastify

  fastify.route({
    method: 'GET',
    path: '/',
    config: {
      public: false,
    },
    schema: {
      summary: 'List article categories',
      description: 'Retrieve article categories.',
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
                  .description('Article categories.')
                  .prop('id', S.string().format('uuid'))
                  .description('Category id.')
                  .required()
                  .prop('name', S.string())
                  .description('Category name.')
                  .required()
                  .prop('description', S.string())
                  .description('Category description.')
                  .required()
              )
          ),
      },
    },
    handler: onListArticleCategories,
  })

  async function onListArticleCategories() {
    const categories = await massive.categories.find(
      { type: 'ARTICLE' },
      {
        order: [
          {
            field: 'name',
            direction: 'asc',
          },
        ],
      }
    )

    return { results: categories }
  }
}
