import S from 'fluent-json-schema'

import { sInternalNote } from './lib/schema.js'
import { getCategoryTypes } from '../categories/lib/common.js'
import { CATEGORY_TYPES } from '../common/enums.js'
import { buildRouteFullDescription } from '../common/common.js'

export default async function listInternalNotes(fastify) {
  const { massive } = fastify
  const routeDescription = 'List internal notes'

  const { errors, throwNotFoundError } = fastify.internalNotesErrors

  fastify.route({
    method: 'GET',
    path: '/',
    config: {
      public: false,
    },
    schema: {
      summary: routeDescription,
      description: buildRouteFullDescription({
        description: routeDescription,
        errors,
        api: 'list',
      }),
      query: S.object()
        .additionalProperties(false)
        .prop('entityId', S.string().format('uuid'))
        .description('Filter by entity id.')
        .required()
        .prop(
          'category',
          S.string().minLength(3).maxLength(50).enum(getCategoryTypes())
        )
        .description('Internal note category.')
        .required(),
      response: {
        200: S.object()
          .additionalProperties(false)
          .prop('results', S.array().maxItems(200).items(sInternalNote()))
          .required(),
        404: fastify.getSchema('sNotFound'),
      },
    },
    preHandler: onPreHandler,
    handler: onListInternalNotes,
  })

  async function onPreHandler(req) {
    const { entityId, category } = req.query

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

  async function onListInternalNotes(req) {
    const internalNotes = await massive.internalNotes
      .join({
        users: {
          type: 'INNER',
          on: { id: 'ownerId' },
        },
      })
      .find(buildFilters(req.query), {
        order: [
          {
            field: 'createdAt',
            direction: 'desc',
          },
        ],
      })

    return {
      results: internalNotes.map(item => {
        const author = item.users[0]
        item.author = `${author.first_name} ${author.last_name}`
        return item
      }),
    }
  }

  function buildFilters(query) {
    const { entityId, category } = query

    if (category === CATEGORY_TYPES.ARTICLE) {
      return { articleId: entityId }
    }

    if (category === CATEGORY_TYPES.ACTIVITY) {
      return { activityId: entityId }
    }
  }
}
