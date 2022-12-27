import S from 'fluent-json-schema'

import { sArticleDetail } from '../lib/schema.js'
import { populateArticle } from '../lib/common.js'
import { restrictDataToOwner } from '../../common/common.js'

export default async function readArticle(fastify) {
  const { massive, httpErrors } = fastify
  const { createError } = httpErrors
  const permission = 'article:read'

  fastify.route({
    method: 'GET',
    path: '/:id',
    config: {
      public: false,
      permission,
    },
    schema: {
      summary: 'Get article',
      description: `Permission required: ${permission}`,
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
      throw createError(404, 'Invalid input', {
        validation: [{ message: `Article '${id}' not found` }],
      })
    }

    if (restrictDataToOwner(apiPermission) && article.ownerId !== userId) {
      throw httpErrors.forbidden(
        'Only the owner (and admin) can access to this article'
      )
    }

    req.article = article
  }

  async function onReadArticle(req) {
    const { article } = req
    const { id: currentUserId } = req.user

    return populateArticle(article, currentUserId, massive)
  }
}
