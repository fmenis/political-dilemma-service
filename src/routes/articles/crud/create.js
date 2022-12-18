import _ from 'lodash'

import { sCreateArticle, sArticle } from '../lib/schema.js'
import { ARTICLE_STATES } from '../../common/enums.js'
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
      trimBodyFields: ['title', 'text', 'description', 'tags'],
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
    const { categoryId, title, tags = [], attachmentIds = [] } = req.body

    const category = await massive.categories.findOne(categoryId)
    if (!category) {
      throw createError(404, 'Invalid input', {
        validation: [{ message: `Category '${categoryId}' not found` }],
      })
    }

    //TODO aggiungere validazione tipo categoria

    const duplicates = await massive.articles.where(
      'LOWER(title) = TRIM(LOWER($1))',
      [`${title.trim()}`]
    )
    if (duplicates.length > 0) {
      throw httpErrors.conflict(`Article with title '${title}' already exists`)
    }

    const duplicatedTags = findArrayDuplicates(tags)
    if (duplicatedTags.length) {
      throw createError(400, 'Invalid input', {
        validation: [
          {
            message: `Duplicate tags: ${duplicatedTags.join(', ')}`,
          },
        ],
      })
    }

    const duplicatedAttachmentIds = findArrayDuplicates(attachmentIds)
    if (duplicatedAttachmentIds.length) {
      throw createError(400, 'Invalid input', {
        validation: [
          {
            message: `Duplicate attachments ids: ${duplicatedAttachmentIds.join(
              ', '
            )}`,
          },
        ],
      })
    }

    const files = await massive.files.find({ id: attachmentIds })
    if (files.length < attachmentIds.length) {
      const missing = _.difference(
        attachmentIds,
        files.map(item => item.id)
      )
      throw createError(400, 'Invalid input', {
        validation: [
          {
            message: `Attachment ids '${missing.join(', ')}' not found`,
          },
        ],
      })
    }
  }

  async function onCreateArticle(req, reply) {
    const {
      title,
      text,
      description,
      categoryId,
      tags,
      attachmentIds = [],
    } = req.body
    const { user } = req

    const params = {
      title,
      text,
      categoryId,
      description,
      status: ARTICLE_STATES.DRAFT,
      ownerId: user.id,
      tags,
    }

    const newArticle = await massive.withTransaction(async tx => {
      const newArticle = await tx.articles.save(params)

      await Promise.all(
        attachmentIds.map(attachmentId => {
          tx.files.save({ id: attachmentId, articleId: newArticle.id })
        })
      )

      return newArticle
    })

    const owner = await massive.users.findOne(user.id)

    reply.resourceId = newArticle.id
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
      updatedAt: newArticle.updatedAt,
      canBeDeleted: newArticle.status === ARTICLE_STATES.DRAFT,
      tags: newArticle.tags || undefined,
      description: newArticle.description || undefined,
    }
  }
}
