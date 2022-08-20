import _ from 'lodash'

import { sCreateArticle, sArticleResponse } from '../lib/schema.js'
import { STATUS } from '../lib/enums.js'
import { findArrayDuplicates } from '../../../utils/main.js'

export default async function createArticle(fastify) {
  const { massive, httpErrors } = fastify
  const { createError } = httpErrors
  const permission = 'article:create'

  fastify.route({
    method: 'POST',
    path: '/',
    config: {
      public: false,
      permission,
    },
    schema: {
      summary: 'Create article',
      description: `Permission required: ${permission}`,
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
    const { categoryId, title, tagsIds } = req.body

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

    const duplicatedTagsIds = findArrayDuplicates(tagsIds)
    if (duplicatedTagsIds.length) {
      throw createError(400, 'Invalid input', {
        validation: [
          {
            message: `Duplicate tags ids: ${duplicatedTagsIds.join(', ')}`,
          },
        ],
      })
    }

    const tags = await massive.tags.find({ id: tagsIds })
    if (tags.length < tagsIds.length) {
      const missing = _.difference(
        tagsIds,
        tags.map(item => item.id)
      )
      throw createError(400, 'Invalid input', {
        validation: [
          {
            message: `Tags ids ${missing.join(', ')} not found`,
          },
        ],
      })
    }
  }

  async function onCreateArticle(req, reply) {
    const { title, text, description, categoryId, tagsIds } = req.body
    const { user } = req

    const params = {
      title,
      text,
      categoryId,
      description,
      status: STATUS.DRAFT,
      ownerId: user.id,
    }

    //##TODO mettere sotto transazione i salvataggi
    const newArticle = await massive.articles.save(params)
    await associateTags(newArticle.id, tagsIds)

    const [owner, tags] = await Promise.all([
      massive.users.findOne(user.id),
      massive.tags.find({
        id: tagsIds,
      }),
    ])

    reply.code(201).send({
      id: newArticle.id,
      title: newArticle.title,
      text: newArticle.text,
      categoryId,
      status: newArticle.status,
      author: `${owner.first_name} ${owner.last_name}`,
      createdAt: newArticle.createdAt,
      publishedAt: newArticle.publishedAt,
      tags: tags.map(tag => tag.name),
    })
  }

  async function associateTags(articleId, tagsIds) {
    await Promise.all(
      tagsIds.map(tagId => {
        massive.articlesTags.save({ articleId, tagId })
      })
    )
  }
}
