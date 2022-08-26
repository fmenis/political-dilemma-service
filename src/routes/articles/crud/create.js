import _ from 'lodash'

import { sCreateArticle, sArticle } from '../lib/schema.js'
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
        201: sArticle(),
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

    if (tagsIds) {
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

    const newArticle = await massive.withTransaction(async tx => {
      const newArticle = await tx.articles.save(params)

      if (tagsIds) {
        await Promise.all(
          tagsIds.map(tagId => {
            tx.articlesTags.save({ articleId: newArticle.id, tagId })
          })
        )
      }

      return newArticle
    })

    const owner = await massive.users.findOne(user.id)
    let tags

    if (tagsIds) {
      tags = await massive.tags.find({
        id: tagsIds,
      })
    }

    reply.code(201)

    return {
      id: newArticle.id,
      title: newArticle.title,
      text: newArticle.text,
      categoryId,
      status: newArticle.status,
      author: `${owner.first_name} ${owner.last_name}`,
      createdAt: newArticle.createdAt,
      publishedAt: newArticle.publishedAt,
      tags: tags ? tags.map(tag => tag.name) : [],
    }
  }
}
