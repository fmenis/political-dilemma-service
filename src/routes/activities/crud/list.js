import S from 'fluent-json-schema'

import { appConfig } from '../../../config/main.js'
import { sActivityList } from '../lib/activity.schema.js'
import { buildRouteFullDescription } from '../../common/common.js'
import { buildPaginatedInfo, restrictDataToOwner } from '../../common/common.js'

export default async function listActivities(fastify) {
  const { massive } = fastify
  const { errors } = fastify.activityErrors
  const { defaultLimit, defaultOffset } = appConfig.pagination

  const routeDescription = 'List activities.'
  const permission = 'activity:list'

  fastify.route({
    method: 'GET',
    path: '/',
    config: {
      public: false,
      permission,
    },
    schema: {
      summary: 'List activities',
      description: buildRouteFullDescription({
        description: routeDescription,
        errors,
        permission,
        api: 'list',
      }),
      query: S.object()
        .additionalProperties(false)
        .prop('limit', S.integer())
        .description('Number of results (pagination).')
        .default(defaultLimit)
        .prop('offset', S.integer())
        .description('Items to skip (pagination).')
        .default(defaultOffset),
      response: {
        200: S.object()
          .additionalProperties(false)
          .description('Activities.')
          .prop('results', S.array().maxItems(200).items(sActivityList()))
          .required()
          .prop('paginatedInfo', fastify.getSchema('sPaginatedInfo'))
          .required(),
      },
    },
    handler: onListActivities,
  })

  async function onListActivities(req) {
    const { query, user } = req

    const filters = buildFilters(user)
    const options = buildOptions(query)

    const [activities, count] = await Promise.all([
      massive.activity
        .join({
          categories: {
            on: { id: 'categoryId' },
          },
          users: {
            on: { id: 'ownerId' },
          },
        })
        .find(filters, options),
      massive.activity //##TODO controllare se serve il join sulla count
        .join({
          categories: {
            on: { id: 'categoryId' },
          },
          users: {
            on: { id: 'ownerId' },
          },
        })
        .count(filters),
    ])

    return {
      results: await populateActivities(activities, user.id),
      paginatedInfo: buildPaginatedInfo(count, {
        limit: query.limit,
        offset: query.offset,
      }),
    }
  }

  function buildFilters(user) {
    const { id: userId, apiPermission } = user
    const filters = {}

    if (restrictDataToOwner(apiPermission)) {
      filters.ownerId = userId
    }

    return {}
  }

  function buildOptions(query) {
    const options = {
      order: [
        {
          field: 'updatedAt',
          direction: 'desc',
        },
      ],
      limit: query.limit,
      offset: query.offset,
    }

    return options
  }

  async function populateActivities(activities, currentUserId) {
    const internalNotes = await massive.internalNotes.find({
      activityId: activities.map(item => item.id),
    })

    return activities.map(activity => {
      const author = activity.users[0]
      const categoryName = activity.categories[0].name
      return {
        id: activity.id,
        title: activity.title,
        type: activity.type,
        shortType: activity.shortType,
        status: activity.status,
        author: `${author.first_name} ${author.last_name}`,
        category: categoryName,
        isMine: activity.ownerId === currentUserId,
        hasNotifications: internalNotes.some(
          item => item.activityId === activity.id
        ),
      }
    })
  }
}
