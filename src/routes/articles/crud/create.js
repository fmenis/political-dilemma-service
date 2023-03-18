import _ from 'lodash'

import { sCreateArticle, sArticleDetail } from '../lib/schema.js'
import { ARTICLE_STATES } from '../../common/enums.js'
import { populateArticle } from '../lib/common.js'
import { buildRouteFullDescription } from '../../common/common.js'

export default async function createArticle(fastify) {
  const { massive } = fastify
  const {
    errors,
    throwNotFoundError,
    throwInvalidCategoryError,
    throwDuplicateTitleError,
    throwAttachmentsNotFoundError,
  } = fastify.articleErrors

  const api = 'create'
  const permission = `article:${api}`

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
      description: buildRouteFullDescription({
        description: 'Create article.',
        errors,
        permission,
        api,
      }),
      body: sCreateArticle(),
      response: {
        201: sArticleDetail(),
        404: fastify.getSchema('sNotFound'),
        409: fastify.getSchema('sConflict'),
      },
    },
    preHandler: onPreHandler,
    handler: onCreateArticle,
  })

  async function onPreHandler(req) {
    const { categoryId, title, attachmentIds = [] } = req.body

    const category = await massive.categories.findOne(categoryId)
    if (!category) {
      throwNotFoundError({ id: categoryId, name: 'category' })
    }
    if (category.type !== 'ARTICLE') {
      throwInvalidCategoryError({ id: categoryId, type: category.type })
    }

    const titleDuplicates = await massive.articles.where(
      'LOWER(title) = TRIM(LOWER($1))',
      [`${title.trim()}`]
    )
    if (titleDuplicates.length > 0) {
      throwDuplicateTitleError({ title })
    }

    const files = await massive.files.find({ id: attachmentIds })
    if (files.length < attachmentIds.length) {
      throwAttachmentsNotFoundError({ attachmentIds, files })
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
    const { id: ownerId } = req.user

    const params = {
      title,
      text,
      categoryId,
      description,
      status: ARTICLE_STATES.DRAFT,
      ownerId,
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

    reply.resourceId = newArticle.id
    reply.code(201)

    return populateArticle(newArticle, ownerId, massive)
  }
}
