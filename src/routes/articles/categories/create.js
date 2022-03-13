import S from 'fluent-json-schema'

export default async function createArticleCategory(fastify) {
  const { massive } = fastify

  fastify.route({
    method: 'POST',
    path: '/',
    config: {
      public: false,
      permission: 'article-category:create',
    },
    schema: {
      summary: 'Create article category',
      description: 'Create article article.',
      body: S.object()
        .additionalProperties(false)
        .prop('name', S.string().minLength(3).maxLength(200))
        .description('Category name')
        .required(),
      response: {
        201: S.object()
          .additionalProperties(false)
          .description('Article category.')
          .prop('id', S.string().format('uuid'))
          .description('Category id.')
          .required()
          .prop('name', S.string())
          .description('Category name.')
          .required(),
      },
    },
    handler: onCreateArticleCategory,
  })

  async function onCreateArticleCategory(req, reply) {
    const { name } = req.body

    const newCategory = await massive.articleCategories.save({ name })

    reply.code(201)
    return newCategory
  }
}
