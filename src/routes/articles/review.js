import S from 'fluent-json-schema'

import { ARTICLE_STATES } from './lib/enums.js'
import { sArticle } from './lib/schema.js'
import { populateArticle } from './lib/common.js'

export default async function reviewArticle(fastify) {
  const { massive, httpErrors } = fastify
  const { createError } = httpErrors
  const permission = 'article:review'

  fastify.route({
    method: 'POST',
    path: '/:id/review',
    config: {
      public: false,
      permission,
    },
    schema: {
      summary: 'Review article',
      description: `Permission required: ${permission}`,
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
        200: sArticle(),
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
      throw createError(404, 'Invalid input', {
        validation: [{ message: `Article '${id}' not found` }],
      })
    }

    if (
      article.status !== ARTICLE_STATES.DRAFT &&
      article.status !== ARTICLE_STATES.REWORK
    ) {
      throw createError(409, 'Conflict', {
        validation: [
          {
            message: `Invalid action on article '${id}'. Required status '${ARTICLE_STATES.DRAFT}' or '${ARTICLE_STATES.REWORK}'`,
          },
        ],
      })
    }

    if (!article.description || !article.text) {
      const errors = []

      if (!article.description) {
        errors.push({
          message: `Invalid action on article '${id}'. The description must be provided`,
        })
      }

      if (!article.text) {
        errors.push({
          message: `Invalid action on article '${id}'. The text must be provided`,
        })
      }

      throw createError(409, 'Conflict', {
        validation: errors,
      })
    }

    req.article = article
  }

  async function onReviewArticle(req) {
    const { article } = req
    const { id: ownerId } = req.user
    const { note } = req.body

    article.status = ARTICLE_STATES.IN_REVIEW

    await massive.withTransaction(async tx => {
      await tx.articles.update(article.id, article)

      if (note) {
        await tx.internalNotes.save({
          ownerId,
          text: note,
          relatedDocumentId: article.id,
          category: 'articles',
        })
      }
    })

    return populateArticle(article, massive)
  }
}
