import S from 'fluent-json-schema'

import { ARTICLE_STATES, CATEGORY_TYPES } from '../common/enums.js'
import { sArticleDetail } from './lib/schema.js'
import { populateArticle } from './lib/common.js'
import { buildRouteFullDescription } from '../common/common.js'

export default async function reworkArticle(fastify) {
  const { massive } = fastify
  const { throwNotFoundError, throwInvalidStatusError, errors } =
    fastify.articleErrors

  const api = 'rework'
  const permission = `article:${api}`

  fastify.route({
    method: 'POST',
    path: '/:id/rework',
    config: {
      public: false,
      permission,
      trimBodyFields: ['note'],
    },
    schema: {
      summary: 'Rework article',
      description: buildRouteFullDescription({
        description: 'Rework article',
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
        .description('Article note.'),
      response: {
        200: sArticleDetail(),
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
      throwNotFoundError({ id, name: 'activity' })
    }

    if (article.status !== ARTICLE_STATES.IN_REVIEW) {
      throwInvalidStatusError({
        id,
        requiredStatus: `${ARTICLE_STATES.IN_REVIEW}`,
      })
    }

    req.resource = article
  }

  async function onReworkArticle(req) {
    const { resource: article } = req
    const { id: ownerId } = req.user
    const { note } = req.body

    const updatedArticle = {
      ...article,
      status: ARTICLE_STATES.REWORK,
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
