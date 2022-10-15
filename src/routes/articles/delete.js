import S from 'fluent-json-schema'

import { ARTICLE_STATES } from './lib/enums.js'
import { sArticle } from './lib/schema.js'
import { populateArticle } from './lib/common.js'

export default async function deleteArticle(fastify) {
  const { massive, httpErrors } = fastify
  const { createError } = httpErrors
  const permission = 'article:delete-action'

  fastify.route({
    method: 'POST',
    path: '/:id/delete',
    config: {
      public: false,
      permission,
    },
    schema: {
      summary: 'Delete article',
      description: `Permission required: ${permission}`,
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.string().format('uuid'))
        .description('Article id.')
        .required(),
      body: S.object()
        .additionalProperties(false)
        .prop('cancellationReason', S.string().minLength(3).maxLength(250))
        .description('Article deletion reason.')
        .required(),
      response: {
        200: sArticle(),
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

    if (
      article.status === ARTICLE_STATES.DRAFT ||
      article.status === ARTICLE_STATES.DELETED
    ) {
      throw createError(409, 'Conflict', {
        validation: [
          {
            message: `Invalid action on article '${id}'. Required status: not '${ARTICLE_STATES.DRAFT}' or '${ARTICLE_STATES.DELETED}'`,
          },
        ],
      })
    }

    req.article = article
  }

  async function onDeleteArticle(req) {
    const { article } = req
    const { id: ownerId } = req.user
    const { cancellationReason } = req.body

    const updatedArticle = {
      ...article,
      status: ARTICLE_STATES.DELETED,
      cancellationReason,
      updatedAt: new Date(),
      deletedBy: ownerId,
    }

    await massive.articles.update(updatedArticle.id, updatedArticle)

    return populateArticle(updatedArticle, massive)
  }
}
