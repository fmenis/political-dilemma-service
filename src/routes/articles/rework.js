import S from 'fluent-json-schema'

import { ARTICLE_STATES } from './lib/enums.js'
import { sArticle } from './lib/schema.js'
import { populateArticle } from './lib/common.js'

export default async function reworkArticle(fastify) {
  const { massive, httpErrors } = fastify
  const { createError } = httpErrors
  const permission = 'article:rework'

  fastify.route({
    method: 'POST',
    path: '/:id/rework',
    config: {
      public: false,
      permission,
    },
    schema: {
      summary: 'Rework article',
      description: `Permission required: ${permission}`,
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.string().format('uuid'))
        .description('Article id.')
        .required(),
      body: S.object()
        .additionalProperties(false)
        .prop('note', S.string().minLength(3).maxLength(250))
        .description('Article note.')
        .required(),
      response: {
        200: sArticle(),
        404: fastify.getSchema('sNotFound'),
        409: fastify.getSchema('sConflict'),
      },
    },
    preHandler: onPreHandler,
    handler: onReworkArticle,
  })

  async function onPreHandler(req) {
    const { id } = req.params

    const article = await massive.articles.findOne(id)
    if (!article) {
      throw createError(404, 'Invalid input', {
        validation: [{ message: `Article '${id}' not found` }],
      })
    }

    if (article.status !== ARTICLE_STATES.IN_REVIEW) {
      throw createError(409, 'Conflict', {
        validation: [
          {
            message: `Invalid action on article '${id}'. Required status '${ARTICLE_STATES.IN_REVIEW}'`,
          },
        ],
      })
    }

    req.article = article
  }

  async function onReworkArticle(req) {
    const { article } = req
    const { id: ownerId } = req.user
    const { note } = req.body

    article.status = ARTICLE_STATES.REWORK

    await massive.withTransaction(async tx => {
      await tx.articles.update(article.id, article)
      await tx.internalNotes.save({
        ownerId,
        text: note,
        relatedDocumentId: article.id,
        category: 'articles',
      })
    })

    return populateArticle(article, massive)
  }
}
