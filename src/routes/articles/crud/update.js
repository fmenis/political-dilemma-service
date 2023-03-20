import S from 'fluent-json-schema'
import _ from 'lodash'

import { sUpdateArticle, sArticleDetail } from '../lib/schema.js'
import { findArrayDuplicates, removeObjectProps } from '../../../utils/main.js'
import { populateArticle } from '../lib/common.js'
import { restrictDataToOwner } from '../../common/common.js'
import { ARTICLE_STATES } from '../../common/enums.js'
import { buildRouteFullDescription } from '../../common/common.js'

export default async function updateArticle(fastify) {
  const { massive } = fastify
  const {
    errors,
    throwNotFoundError,
    throwOwnershipError,
    throwInvalidStatusError,
    throwDuplicateTitleError,
  } = fastify.articleErrors

  const api = 'update'
  const permission = `article:${api}`

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
      description: buildRouteFullDescription({
        description: 'Update article.',
        errors,
        permission,
        api,
      }),
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
    const { title, attachmentIds = [] } = req.body
    const { id: userId, apiPermission } = req.user

    const article = await massive.articles.findOne(id)

    if (!article) {
      throwNotFoundError({ id: categoryId, name: 'article' })
    }

    if (
      article.status !== ARTICLE_STATES.DRAFT &&
      article.status !== ARTICLE_STATES.IN_REVIEW &&
      article.status !== ARTICLE_STATES.REWORK
    ) {
      throwInvalidStatusError({
        id,
        requiredStatus: `${ACTIVITY_STATES.DRAFT}, ${ACTIVITY_STATES.IN_REVIEW} or ${ACTIVITY_STATES.REWORK}`,
      })
    }

    if (restrictDataToOwner(apiPermission) && article.ownerId !== userId) {
      throwOwnershipError({ id: userId, email })
    }

    if (title) {
      const titleDuplicates = await massive.articles.where(
        'LOWER(title) = TRIM(LOWER($1))',
        [`${title.trim()}`]
      )

      if (
        titleDuplicates.some(
          item => item.title.toLowerCase() === title.trim().toLowerCase()
        )
      ) {
        throwDuplicateTitleError({ title })
      }
    }

    //##TODO mappare errori
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

    //##TODO mappare errori
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
  }

  async function onUpdateArticle(req) {
    const { id } = req.params
    const { attachmentIds = [] } = req.body
    const { id: currentUserId } = req.user

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
