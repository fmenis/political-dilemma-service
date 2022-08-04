import S from 'fluent-json-schema'

export default async function createArticleTag(fastify) {
  const { massive, httpErrors } = fastify

  fastify.route({
    method: 'POST',
    path: '/',
    config: {
      public: false,
    },
    schema: {
      summary: 'Create article tag.',
      description: 'Create article tag.',
      body: S.object()
        .additionalProperties(false)
        .prop('name', S.string().minLength(1).maxLength(50))
        .description('Tag name.')
        .required(),
      response: {
        201: S.object()
          .additionalProperties(false)
          .description('Article tags.')
          .prop('id', S.string().format('uuid'))
          .description('Tag id.')
          .required()
          .prop('name', S.string())
          .description('Tag name.')
          .required(),
      },
    },
    preHandler: onPreHandler,
    handler: onCreateArticleTag,
  })

  async function onPreHandler(req) {
    const { name } = req.body

    const tag = await massive.tags.findOne({ name })
    if (tag) {
      throw httpErrors.conflict(
        `Cannot create article '${name}', tag name already used'`
      )
    }
  }

  async function onCreateArticleTag(req) {
    const { name } = req.body
    return massive.tags.save({ name })
  }
}
