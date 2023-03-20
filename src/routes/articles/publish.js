import S from 'fluent-json-schema'

import { ARTICLE_STATES, CATEGORY_TYPES } from '../common/enums.js'
import { sArticleDetail } from './lib/schema.js'
import { populateArticle } from './lib/common.js'
import { buildRouteFullDescription } from '../common/common.js'

export default async function publishArticle(fastify) {
  const { massive } = fastify
  const { throwNotFoundError, throwInvalidStatusError, errors } =
    fastify.articleErrors

  const api = 'publish'
  const permission = `article:${api}`

  fastify.route({
    method: 'POST',
    path: '/:id/publish',
    config: {
      public: false,
      permission,
      trimBodyFields: ['note'],
    },
    schema: {
      summary: 'Publish article',
      description: buildRouteFullDescription({
        description: 'Publish article',
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
    handler: onPublishArticle,
  })

  async function onPreHandler(req) {
    const { id } = req.params

    const article = await massive.articles.findOne(id)
    if (!article) {
      throwNotFoundError({ id, name: 'article' })
    }

    if (article.status !== ARTICLE_STATES.READY) {
      throwInvalidStatusError({
        id,
        requiredStatus: `${ARTICLE_STATES.READY}`,
      })
    }

    req.resource = article
  }

  async function onPublishArticle(req) {
    const { resource: article } = req
    const { id: ownerId } = req.user
    const { note } = req.body

    const updatedArticle = {
      ...article,
      status: ARTICLE_STATES.PUBLISHED,
      publishedAt: new Date(),
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
