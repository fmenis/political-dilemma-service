import S from 'fluent-json-schema'

import { ARTICLE_STATES } from './lib/enums.js'
import { sArticle } from './lib/schema.js'
import { populateArticle } from './lib/common.js'

export default async function approveArticle(fastify) {
  const { massive } = fastify

  const {
    throwNotFound,
    throwInvalidStatusError,
    throwInvalidPublicationDate,
  } = fastify.articleErrors

  const permission = 'article:approve'

  fastify.route({
    method: 'POST',
    path: '/:id/approve',
    config: {
      public: false,
      permission,
    },
    schema: {
      summary: 'Approve article',
      description: `Permission required: ${permission} \n. Possibile errors: NOT_FOUND, INVALID_PUBLICATION_DATE, INVALID_ACTION`,
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.string().format('uuid'))
        .description('Article id.')
        .required(),
      body: S.object()
        .additionalProperties(false)
        .prop('note', S.string().minLength(3).maxLength(250))
        .description('Article note.')
        .prop('publicationDate', S.string().format('date-time'))
        .description('Article publication date.'),
      response: {
        200: sArticle(),
        404: fastify.getSchema('sNotFound'),
        409: fastify.getSchema('sConflict'),
      },
    },
    preValidation: onPreValidation,
    preHandler: onPreHandler,
    handler: onApproveArticle,
  })

  async function onPreValidation(req) {
    if (req.body.note) {
      req.body.note = req.body.note.trim()
    }
  }

  async function onPreHandler(req) {
    const { id } = req.params
    const { publicationDate } = req.body

    const article = await massive.articles.findOne(id)
    if (!article) {
      throwNotFound({ id })
    }

    if (article.status !== ARTICLE_STATES.IN_REVIEW) {
      throwInvalidStatusError({ id, requiredStatus: ARTICLE_STATES.IN_REVIEW })
    }

    if (publicationDate && publicationDate <= new Date().toISOString()) {
      throwInvalidPublicationDate({ publicationDate })
    }

    req.article = article
  }

  async function onApproveArticle(req) {
    const { article } = req
    const { id: ownerId } = req.user
    const { note, publicationDate } = req.body

    article.status = ARTICLE_STATES.READY
    article.publishedAt = publicationDate || null

    const updatedArticle = {
      ...article,
      status: ARTICLE_STATES.READY,
      publishedAt: publicationDate || null,
      updatedAt: new Date(),
    }

    await massive.withTransaction(async tx => {
      await tx.articles.update(updatedArticle.id, updatedArticle)

      if (note) {
        await tx.internalNotes.save({
          ownerId,
          text: note,
          articleId: updatedArticle.id,
          category: 'articles',
        })
      }
    })

    return populateArticle(updatedArticle, massive)
  }
}
