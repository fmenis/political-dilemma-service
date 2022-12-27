import S from 'fluent-json-schema'
import _ from 'lodash'

import { sUpdateArticle, sArticleDetail } from '../lib/schema.js'
import { findArrayDuplicates, removeObjectProps } from '../../../utils/main.js'
import { populateArticle } from '../lib/common.js'
import { restrictDataToOwner } from '../../common/common.js'
import { ARTICLE_STATES } from '../../common/enums.js'

export default async function updateArticle(fastify) {
  const { massive, httpErrors } = fastify
  const { createError } = httpErrors
  const permission = 'article:update'

  fastify.route({
    method: 'PATCH',
    path: '/:id',
    config: {
      public: false,
      permission,
      trimBodyFields: ['title', 'text', 'description', 'tags'],
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
        200: sArticleDetail(),
        404: fastify.getSchema('sNotFound'),
        409: fastify.getSchema('sConflict'),
      },
    },
    preHandler: onPreHandler,
    handler: onUpdateArticle,
  })

  async function onPreHandler(req) {
    const { id } = req.params
    const { tags = [], attachmentIds = [] } = req.body
    const { id: userId, apiPermission } = req.user

    const article = await massive.articles.findOne(id)

    if (!article) {
      throw createError(404, 'Invalid input', {
        validation: [{ message: `Article '${id}' not found` }],
      })
    }

    if (
      article.status === ARTICLE_STATES.ARCHIVED ||
      article.status === ARTICLE_STATES.DELETED
    ) {
      throw createError(409, 'Conflict', {
        validation: [
          {
            message: `Invalid action on article '${id}'. Required status: not ${ARTICLE_STATES.ARCHIVED} or '${ARTICLE_STATES.DELETED}'`,
          },
        ],
      })
    }

    if (restrictDataToOwner(apiPermission) && article.ownerId !== userId) {
      throw httpErrors.forbidden(
        'Only the owner (and admin) can access to this article'
      )
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

    const attachments = await massive.files.find({ id: attachmentIds })
    if (attachments.length < attachmentIds.length) {
      const missing = _.difference(
        attachmentIds,
        attachments.map(item => item.id)
      )
      throw createError(400, 'Invalid input', {
        validation: [
          {
            message: `Attachment ids '${missing.join(', ')}' not found`,
          },
        ],
      })
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
  }

  async function onUpdateArticle(req) {
    const { id } = req.params
    const { attachmentIds = [] } = req.body
    const { id: currentUserId } = req.body

    const updatedArticle = await massive.withTransaction(async tx => {
      const updatedArticle = await tx.articles.update(id, {
        ...removeObjectProps(req.body, ['attachmentIds']),
        updatedAt: new Date(),
      })

      if (attachmentIds.length) {
        // remove and re-assign all article reference of the files
        await tx.files.update(
          {
            articleId: updatedArticle.id,
          },
          {
            articleId: null,
          }
        )

        await Promise.all(
          attachmentIds.map(attachmentId => {
            tx.files.save({ id: attachmentId, articleId: updatedArticle.id })
          })
        )
      }

      if (!attachmentIds.length) {
        await tx.files.destroy({ articleId: updatedArticle.id })
      }

      return updatedArticle
    })

    return populateArticle(updatedArticle, currentUserId, massive)
  }
}
