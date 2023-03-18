import S from 'fluent-json-schema'
import { ARTICLE_STATES } from '../../common/enums.js'
import { restrictDataToOwner } from '../../common/common.js'
import { buildRouteFullDescription } from '../../common/common.js'

export default async function deleteArticle(fastify) {
  const { massive, httpErrors } = fastify
  const {
    errors,
    throwNotFoundError,
    throwOwnershipError,
    throwInvalidStatusError,
  } = fastify.articleErrors

  const api = 'delete'
  const permission = `article:${api}`

  fastify.route({
    method: 'DELETE',
    path: '/:id',
    config: {
      public: false,
      permission: 'article:delete',
    },
    schema: {
      summary: 'Delete article',
      description: buildRouteFullDescription({
        description: 'Update article.',
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
        204: fastify.getSchema('sNoContent'),
        404: fastify.getSchema('sNotFound'),
        409: fastify.getSchema('sConflict'),
      },
    },
    preHandler: onPreHandler,
    handler: onDeleteArticle,
  })

  async function onPreHandler(req) {
    const { id } = req.params
    const { id: userId, apiPermission } = req.user

    const article = await massive.articles.findOne(id)

    if (!article) {
      throwNotFoundError({ id: categoryId, name: 'article' })
    }

    if (article.status !== ARTICLE_STATES.DRAFT) {
      throwOwnershipError({ id: userId, email })
    }

    if (restrictDataToOwner(apiPermission) && article.ownerId !== userId) {
      throwInvalidStatusError({
        id,
        requiredStatus: ACTIVITY_STATES.DRAFT,
      })
    }
  }

  async function onDeleteArticle(req, reply) {
    const { id } = req.params

    await massive.articles.destroy(id)
    reply.code(204)
  }
}
