import S from 'fluent-json-schema'
import _ from 'lodash'

import { sUpdateArticle, sArticle } from '../lib/schema.js'
import { STATUS } from '../lib/enums.js'
import { findArrayDuplicates, removeObjectProps } from '../../../utils/main.js'

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
    const { attachmentIds = [] } = req.body
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
  }

  async function onUpdateArticle(req) {
    const { id } = req.params
    const { attachmentIds = [] } = req.body

    const updatedArticle = await massive.withTransaction(async tx => {
      const updatedArticle = await tx.articles.update(
        id,
        removeObjectProps(req.body, ['attachmentIds'])
      )

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

      return updatedArticle
    })

    const [owner, attachments] = await Promise.all([
      massive.users.findOne(updatedArticle.ownerId, {
        fields: ['first_name', 'last_name'],
      }),
      massive.files.find(
        {
          articleId: updatedArticle.id,
        },
        { fields: ['id', 'url'] }
      ),
    ])

    return {
      id: updatedArticle.id,
      title: updatedArticle.title,
      text: updatedArticle.text,
      categoryId: updatedArticle.categoryId,
      status: updatedArticle.status,
      author: `${owner.first_name} ${owner.last_name}`,
      createdAt: updatedArticle.createdAt,
      publishedAt: updatedArticle.publishedAt,
      //##TODO
      tagsIds: ['86870ab8-0aa7-40c9-920f-4e730e494e1b'],
      canBeDeleted: updatedArticle.status === STATUS.DRAFT,
      attachments,
    }
  }
}
