import S from 'fluent-json-schema'
import { ARTICLE_STATES } from '../lib/enums.js'

export default async function deleteArticle(fastify) {
  const { massive, httpErrors } = fastify
  const { createError } = httpErrors
  const permission = 'article:delete'

  fastify.route({
    method: 'DELETE',
    path: '/:id',
    config: {
      public: false,
      permission: 'article:delete',
    },
    schema: {
      summary: 'Delete article',
      description: `Permission required: ${permission}`,
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.string().format('uuid'))
        .description('Article id.')
        .required(),
      response: {
        204: fastify.getSchema('sNoContent'),
        404: fastify.getSchema('sNotFound'),
        409: fastify.getSchema('sConflict'),
      },
    },
    preHandler: onPreHandler,
    handler: onDeleteArticle,
  })

  async function onPreHandler(req) {
    const { id } = req.params

    const article = await massive.articles.findOne(id)

    if (!article) {
      throw createError(404, 'Invalid input', {
        validation: [{ message: `Article '${id}' not found` }],
      })
    }

    if (article.status !== ARTICLE_STATES.DRAFT) {
      throw httpErrors.conflict(
        `Cannot delete article '${article.id}', is not in status '${ARTICLE_STATES.DRAFT}'`
      )
    }

    //TODO rivedere durante analisi permessi
    // if (article.ownerId !== currentUserId) {
    //   throw httpErrors.forbidden(
    //     `Cannot delete article '${article.id}', the current user '${currentUserId}' is not the article owner '${article.ownerId}'`
    //   )
    // }
  }

  async function onDeleteArticle(req, reply) {
    const { id } = req.params

    await massive.articles.destroy(id)
    reply.code(204)
  }
}
