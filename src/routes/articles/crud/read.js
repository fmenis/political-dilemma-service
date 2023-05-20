import S from 'fluent-json-schema'

import { sArticleDetail } from '../lib/schema.js'
import { populateArticle } from '../lib/common.js'
import { restrictDataToOwner } from '../../common/common.js'
import { buildRouteFullDescription } from '../../common/common.js'

export default async function readArticle(fastify) {
  const { massive } = fastify
  const { errors, throwNotFoundError, throwOwnershipError } =
    fastify.articleErrors

  const api = 'read'
  const permission = `article:${api}`

  fastify.route({
    method: 'GET',
    path: '/:id',
    config: {
      public: false,
      permission,
    },
    schema: {
      summary: 'Get article',
      description: buildRouteFullDescription({
        description: 'Get article.',
        errors,
        permission,
        api,
      }),
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.string().format('uuid'))
        .description('Article id.')
        .required(),
      response: {
        200: sArticleDetail(),
        404: fastify.getSchema('sNotFound'),
      },
    },
    preHandler: onPreHandler,
    handler: onReadArticle,
  })

  async function onPreHandler(req) {
    const { id } = req.params
    const { id: userId, apiPermission } = req.user

    const article = await massive.articles.findOne(id)
    if (!article) {
      throw throwNotFoundError({ id, name: 'article' })
    }

    if (restrictDataToOwner(apiPermission) && article.ownerId !== userId) {
      throwOwnershipError({ id: userId, email })
    }

    req.resource = article
  }

  async function onReadArticle(req) {
    const { resource: article } = req
    const { id: currentUserId } = req.user

    return populateArticle(article, currentUserId, massive)
  }
}
