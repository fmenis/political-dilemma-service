import S from 'fluent-json-schema'

import { sInternalNote } from './lib/schema.js'
import { getCategoryTypes } from '../categories/lib/common.js'
import { CATEGORY_TYPES } from '../common/enums.js'
import { buildRouteFullDescription } from '../common/common.js'

export default async function createInternalNote(fastify) {
  const { massive } = fastify
  const routeDescription = 'Create internal note'

  const { errors, throwNotFoundError } = fastify.internalNotesErrors

  fastify.route({
    method: 'POST',
    path: '/',
    config: {
      public: false,
      trimBodyFields: ['text'],
    },
    schema: {
      summary: routeDescription,
      description: buildRouteFullDescription({
        description: routeDescription,
        errors,
        api: 'create',
      }),
      body: S.object()
        .additionalProperties(false)
        .prop('text', S.string().minLength(3).maxLength(250))
        .description('Internal note text.')
        .required()
        .prop('entityId', S.string().format('uuid'))
        .description('Internal note related entity.')
        .required()
        .prop(
          'category',
          S.string().minLength(3).maxLength(50).enum(getCategoryTypes())
        )
        .description('Internal note category.')
        .required(),
      response: {
        201: sInternalNote(),
        404: fastify.getSchema('sNotFound'),
      },
    },
    preHandler: onPreHandler,
    handler: onCreateInternalNote,
  })

  async function onPreHandler(req) {
    const { entityId, category } = req.body

    let entity

    if (category === CATEGORY_TYPES.ARTICLE) {
      entity = await massive.articles.findOne(entityId, {
        fields: ['id'],
      })
    }

    if (category === CATEGORY_TYPES.ACTIVITY) {
      entity = await massive.activity.findOne(entityId, {
        fields: ['id'],
      })
    }

    if (!entity) {
      throwNotFoundError({ name: category.toLowerCase(), id: entityId })
    }
  }

  async function onCreateInternalNote(req, reply) {
    const { entityId, category, text } = req.body
    const { id: ownerId } = req.user

    const params = {
      ownerId,
      text,
      category,
      articleId: category === CATEGORY_TYPES.ARTICLE ? entityId : null,
      activityId: category === CATEGORY_TYPES.ACTIVITY ? entityId : null,
    }

    const [internalNote, owner] = await Promise.all([
      massive.internalNotes.save(params),
      massive.users.findOne(ownerId, {
        fields: ['first_name', 'last_name'],
      }),
    ])

    reply.resourceId = internalNote.id
    reply.code(201)

    return {
      ...internalNote,
      author: `${owner.first_name} ${owner.last_name}`,
    }
  }
}
