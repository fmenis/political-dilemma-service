import S from 'fluent-json-schema'
import { STATUS } from '../lib/enums.js'

export default async function deleteArticle(fastify) {
  const { massive, httpErrors } = fastify
  const { createError } = httpErrors

  fastify.route({
    method: 'DELETE',
    path: '/',
    config: {
      public: false,
      permission: 'article:delete',
    },
    schema: {
      summary: 'Delete article',
      description: 'Delete article by id.',
      querystring: S.object()
        .additionalProperties(false)
        .prop('id', S.string().format('uuid'))
        .description('Article id.')
        .required(),
      response: {
        204: fastify.getSchema('sNoContent'),
      },
    },
    preHandler: onPreHandler,
    handler: onDeleteArticle,
  })

  async function onPreHandler(req) {
    const { id } = req.querystring

    const article = await massive.articles.findOne(id)

    if (!article) {
      throw createError(404, 'Invalid input', {
        validation: [{ message: `Article '${id}' not found` }],
      })
    }

    if (article.status !== STATUS.DRAFT) {
      throw httpErrors.conflict(
        `Cannot delete article '${article.id}', because is not in status '${STATUS.DRAFT}'`
      )
    }
  }

  async function onDeleteArticle(req, reply) {
    const { id } = req.querystring

    await massive.articles.destroy(id)
    reply.code(204)
  }
}
