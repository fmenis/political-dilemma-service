import { sCreateArticle, sArticleResponse } from '../lib/schema.js'
import { STATUS } from '../lib/enums.js'

export default async function createArticle(fastify) {
  const { massive, httpErrors } = fastify
  const { createError } = httpErrors

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
        404: fastify.getSchema('sNotFound'),
        409: fastify.getSchema('sConflict'),
      },
    },
    preHandler: onPreHandler,
    handler: onCreateArticle,
  })

  async function onPreHandler(req) {
    const { categoryId, title } = req.body

    const category = await massive.categories.findOne(categoryId)
    if (!category) {
      throw createError(404, 'Invalid input', {
        validation: [{ message: `Category '${categoryId}' not found` }],
      })
    }

    const duplicateTitle = await massive.articles.findOne({ title })
    if (duplicateTitle) {
      throw httpErrors.conflict(`Article with title '${title}' already exists`)
    }
  }

  async function onCreateArticle(req, reply) {
    const { title, text, description, categoryId } = req.body
    const { user } = req

    const params = {
      title,
      text,
      categoryId,
      description,
      status: STATUS.DRAFTED,
      ownerId: user.id,
    }

    const [newArticle, owner, category] = await Promise.all([
      massive.articles.save(params),
      massive.users.findOne(user.id),
      await massive.categories.findOne(categoryId.id),
    ])

    reply.code(201)

    return {
      id: newArticle.id,
      title: newArticle.title,
      text: newArticle.text,
      category: category.name,
      status: newArticle.status,
      author: `${owner.first_name} ${owner.last_name}`,
      createdAt: newArticle.createdAt,
      publishedAt: newArticle.publishedAt,
    }
  }
}
