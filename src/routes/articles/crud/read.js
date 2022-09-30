import S from 'fluent-json-schema'

import { sArticle } from '../lib/schema.js'
import { STATUS } from '../lib/enums.js'

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
        200: sArticle(),
        404: fastify.getSchema('sNotFound'),
      },
    },
    preHandler: onPreHandler,
    handler: onReadArticle,
  })

  async function onPreHandler(req) {
    const { id } = req.params

    const article = await massive.articles.findOne(id)
    if (!article) {
      throw createError(404, 'Invalid input', {
        validation: [{ message: `Article '${id}' not found` }],
      })
    }
  }

  async function onReadArticle(req) {
    const { id } = req.params
    const article = await massive.articles.findOne(id)

    //TODO migliorare con un join
    const [author, attachments] = await Promise.all([
      massive.users.findOne(article.ownerId, {
        fields: ['id', 'first_name', 'last_name'],
      }),
      massive.files.find({ articleId: article.id }, { fields: ['id', 'url'] }),
    ])

    return {
      ...article,
      author: `${author.first_name} ${author.last_name}`,
      canBeDeleted: article.status === STATUS.DRAFT,
      tags: article.tags || [],
      attachments,
    }
  }
}
