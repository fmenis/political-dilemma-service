import S from 'fluent-json-schema'

import { sUpdateArticle, sArticle } from '../lib/schema.js'

export default async function updateArticle(fastify) {
  const { massive, httpErrors } = fastify
  const { createError } = httpErrors
  const permission = 'article:update'

  fastify.route({
    method: 'POST',
    path: '/:id',
    config: {
      public: false,
      permission,
    },
    schema: {
      summary: 'Update article',
      description: `Permission required: ${permission}`,
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.string().format('uuid'))
        .description('Article id.')
        .required(),
      body: sUpdateArticle(),
      response: {
        200: sArticle(),
        404: fastify.getSchema('sNotFound'),
        409: fastify.getSchema('sConflict'),
      },
    },
    preHandler: onPreHandler,
    handler: onUpdateArticle,
  })

  async function onPreHandler(req) {
    const { id } = req.params
    const currentUserId = req.user.id

    const article = await massive.articles.findOne(id)

    if (!article) {
      throw createError(404, 'Invalid input', {
        validation: [{ message: `Article '${id}' not found` }],
      })
    }

    if (article.ownerId !== currentUserId) {
      throw httpErrors.forbidden(
        `Cannot update article '${article.id}', the current user '${currentUserId}' is not the article owner '${article.ownerId}'`
      )
    }
  }

  async function onUpdateArticle(req, reply) {
    const { id } = req.params

    //TODO migliorare con un join
    const updatedArticle = await massive.articles.update(id, req.body)
    const owner = await massive.users.findOne(updatedArticle.ownerId, {
      fields: ['first_name', 'last_name'],
    })

    reply.code(200).send({
      id: updatedArticle.id,
      title: updatedArticle.title,
      text: updatedArticle.text,
      categoryId: updatedArticle.categoryId,
      status: updatedArticle.status,
      author: `${owner.first_name} ${owner.last_name}`,
      createdAt: updatedArticle.createdAt,
      publishedAt: updatedArticle.publishedAt,
      //##TODO
      tags: ['86870ab8-0aa7-40c9-920f-4e730e494e1b'],
    })
  }
}
