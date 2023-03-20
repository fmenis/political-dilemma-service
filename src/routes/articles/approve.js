import S from 'fluent-json-schema'

import { ARTICLE_STATES, CATEGORY_TYPES } from '../common/enums.js'
import { sArticleDetail } from './lib/schema.js'
import { populateArticle } from './lib/common.js'
import { isPastDate, buildRouteFullDescription } from '../common/common.js'

export default async function approveArticle(fastify) {
  const { massive } = fastify
  const {
    throwNotFound,
    throwInvalidStatusError,
    throwInvalidPublicationDate,
    errors,
  } = fastify.articleErrors

  const api = 'approve'
  const permission = `article:${api}`

  fastify.route({
    method: 'POST',
    path: '/:id/approve',
    config: {
      public: false,
      permission,
      trimBodyFields: ['note'],
    },
    schema: {
      summary: 'Approve article',
      description: buildRouteFullDescription({
        description: 'Approve article',
        errors,
        permission,
        api,
      }),
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
        .description('Article publication date.')
        .required(),
      response: {
        200: sArticleDetail(),
        404: fastify.getSchema('sNotFound'),
        409: fastify.getSchema('sConflict'),
      },
    },
    preHandler: onPreHandler,
    handler: onApproveArticle,
  })

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

    if (isPastDate(publicationDate)) {
      throwInvalidPublicationDate({ publicationDate })
    }

    req.resource = article
  }

  async function onApproveArticle(req) {
    const { resource: article } = req
    const { id: ownerId } = req.user
    const { note, publicationDate } = req.body

    const updatedArticle = {
      ...article,
      status: ARTICLE_STATES.READY,
      publishedAt: publicationDate,
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
