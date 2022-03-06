import { sCreateArticle, sArticleResponse } from '../lib/schema.js'
import { STATUS } from '../lib/enums.js'

export default async function createArticle(fastify) {
  const { massive } = fastify

  fastify.route({
    method: 'POST',
    path: '/',
    config: {
      public: false,
      permission: 'article:create',
    },
    schema: {
      summary: 'Create article',
      description: 'Create article.',
      body: sCreateArticle(),
      response: {
        201: sArticleResponse(),
      },
    },
    handler: onCreateArticle,
  })

  async function onCreateArticle(req, reply) {
    const { title, text, category } = req.body
    const { user } = req

    const newArticle = await massive.articles.save({
      title,
      text,
      category,
      status: STATUS.DRAFTED,
      ownerId: user.id,
    })

    reply.code(201)
    return newArticle
  }
}
