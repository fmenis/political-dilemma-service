import S from 'fluent-json-schema'

import { ARTICLE_STATES as status } from '../common/enums.js'
import { sArticleDetail } from './lib/schema.js'
import { populateArticle } from './lib/common.js'

export default async function removeArticle(fastify) {
  const { massive, httpErrors } = fastify
  const { createError } = httpErrors
  const permission = 'article:remove'

  fastify.route({
    method: 'POST',
    path: '/:id/remove',
    config: {
      public: false,
      permission,
      trimBodyFields: ['cancellationReason'],
    },
    schema: {
      summary: 'Remove article',
      description: `Permission required: ${permission}`,
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.string().format('uuid'))
        .description('Article id.')
        .required(),
      body: S.object()
        .additionalProperties(false)
        .prop('cancellationReason', S.string().minLength(3).maxLength(250))
        .description('Article cancellation reason.')
        .required(),
      response: {
        200: sArticleDetail(),
        404: fastify.getSchema('sNotFound'),
        409: fastify.getSchema('sConflict'),
      },
    },
    preHandler: onPreHandler,
    handler: onRemoveArticle,
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
      article.status === status.DRAFT ||
      article.status === status.ARCHIVED ||
      article.status === status.DELETED
    ) {
      throw createError(409, 'Conflict', {
        validation: [
          {
            message: `Invalid action on article '${id}'. Required status: not '${status.DRAFT}', ${status.ARCHIVED} or '${status.DELETED}'`,
          },
        ],
      })
    }

    req.article = article
  }

  async function onRemoveArticle(req) {
    const { article } = req
    const { cancellationReason } = req.body
    const { id: currentUserId } = req.user

    const updatedArticle = {
      ...article,
      status: status.DELETED,
      cancellationReason,
      updatedAt: new Date(),
    }

    await massive.articles.update(updatedArticle.id, updatedArticle)

    return populateArticle(updatedArticle, currentUserId, massive)
  }
}
