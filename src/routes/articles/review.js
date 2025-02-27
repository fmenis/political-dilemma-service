import S from 'fluent-json-schema'

import { ARTICLE_STATES, CATEGORY_TYPES } from '../common/enums.js'
import { sArticleDetail } from './lib/schema.js'
import { populateArticle } from './lib/common.js'
import { buildRouteFullDescription } from '../common/common.js'

export default async function reviewArticle(fastify) {
  const { massive } = fastify
  const {
    throwNotFoundError,
    throwInvalidStatusError,
    throwMissingDataError,
    errors,
  } = fastify.articleErrors

  const routeDescription = 'Request to review an article.'
  const permission = 'article:review'

  fastify.route({
    method: 'POST',
    path: '/:id/review',
    config: {
      public: false,
      permission,
      trimBodyFields: ['note'],
    },
    schema: {
      summary: 'Review article',
      description: buildRouteFullDescription({
        description: routeDescription,
        errors,
        permission,
        api: 'review',
      }),
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.string().format('uuid'))
        .description('Article id.')
        .required(),
      body: S.object()
        .additionalProperties(false)
        .prop('note', S.string().minLength(3).maxLength(250))
        .description('Article note.'),
      response: {
        200: sArticleDetail(),
        404: fastify.getSchema('sNotFound'),
        409: fastify.getSchema('sConflict'),
      },
    },
    preHandler: onPreHandler,
    handler: onReviewArticle,
  })

  async function onPreHandler(req) {
    const { id } = req.params

    const article = await massive.articles.findOne(id)
    if (!article) {
      throwNotFoundError({ id, name: 'article' })
    }

    if (
      article.status !== ARTICLE_STATES.DRAFT &&
      article.status !== ARTICLE_STATES.REWORK
    ) {
      throwInvalidStatusError({
        id,
        requiredStatus: `${ARTICLE_STATES.DRAFT} or ${ARTICLE_STATES.REWORK}`,
      })
    }

    if (!article.description || !article.text) {
      const errors = []

      if (!article.description) {
        errors.push({
          internalCode: 'MISSING_DESCRIPTION',
          message: `Invalid action on article '${id}'. The description must be provided`,
        })
      }

      if (!article.text) {
        errors.push({
          internalCode: 'MISSING_TEXT',
          message: `Invalid action on article '${id}'. The text must be provided`,
        })
      }

      throwMissingDataError({ id, errors })
    }

    req.article = article
  }

  async function onReviewArticle(req) {
    const { article } = req
    const { id: ownerId } = req.user
    const { note } = req.body

    const updatedArticle = {
      ...article,
      status: ARTICLE_STATES.IN_REVIEW,
      updatedAt: new Date(),
    }

    await massive.withTransaction(async tx => {
      await tx.articles.update(updatedArticle.id, updatedArticle)

      if (note) {
        await tx.internalNotes.save({
          ownerId,
          text: note,
          articleId: updatedArticle.id,
          category: CATEGORY_TYPES.ARTICLE,
        })
      }
    })

    return populateArticle(updatedArticle, ownerId, massive)
  }
}
