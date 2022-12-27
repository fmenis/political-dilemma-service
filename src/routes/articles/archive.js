import S from 'fluent-json-schema'

import { ARTICLE_STATES } from '../common/enums.js'
import { sArticleDetail } from './lib/schema.js'
import { populateArticle } from './lib/common.js'

export default async function archiveArticle(fastify) {
  const { massive, httpErrors } = fastify
  const { createError } = httpErrors
  const permission = 'article:archive'

  fastify.route({
    method: 'POST',
    path: '/:id/archive',
    config: {
      public: false,
      permission,
    },
    schema: {
      summary: 'Archive article',
      description: `Permission required: ${permission}`,
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.string().format('uuid'))
        .description('Article id.')
        .required(),
      body: S.object()
        .additionalProperties(false)
        .prop('note', S.string().minLength(3).maxLength(250))
        .description('Article note.'),
      response: {
        200: sArticleDetail(),
        404: fastify.getSchema('sNotFound'),
        409: fastify.getSchema('sConflict'),
      },
    },
    preValidation: onPreValidation,
    preHandler: onPreHandler,
    handler: onArchiveArticle,
  })

  async function onPreValidation(req) {
    if (req.body.note) {
      req.body.note = req.body.note.trim()
    }
  }

  async function onPreHandler(req) {
    const { id } = req.params

    const article = await massive.articles.findOne(id)
    if (!article) {
      throw createError(404, 'Invalid input', {
        validation: [{ message: `Article '${id}' not found` }],
      })
    }

    if (article.status !== ARTICLE_STATES.PUBLISHED) {
      throw createError(409, 'Conflict', {
        validation: [
          {
            message: `Invalid action on article '${id}'. Required status '${ARTICLE_STATES.PUBLISHED}'`,
          },
        ],
      })
    }

    if (article.status === ARTICLE_STATES.ARCHIVED) {
      throw createError(409, 'Conflict', {
        validation: [
          {
            message: `Invalid action on article '${id}'. Article already archived`,
          },
        ],
      })
    }

    req.article = article
  }

  async function onArchiveArticle(req) {
    const { article } = req
    const { id: ownerId } = req.user
    const { note } = req.body

    const updatedArticle = {
      ...article,
      status: ARTICLE_STATES.ARCHIVED,
      updatedAt: new Date(),
    }

    await massive.withTransaction(async tx => {
      await tx.articles.update(updatedArticle.id, updatedArticle)

      if (note) {
        await tx.internalNotes.save({
          ownerId,
          text: note,
          articleId: updatedArticle.id,
          category: 'articles',
        })
      }
    })

    return populateArticle(updatedArticle, massive)
  }
}
