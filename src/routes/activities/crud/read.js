import S from 'fluent-json-schema'

import {
  buildRouteFullDescription,
  restrictDataToOwner,
} from '../../common/common.js'
import { sActivityDetail } from '../lib/activity.schema.js'
import { populateActivity } from '../lib/common.js'

export default async function readActivity(fastify) {
  const { massive } = fastify
  const { errors, throwNotFoundError, throwOwnershipError } =
    fastify.activityErrors

  const routeDescription = 'List activities.'
  const permission = 'activity:read'

  fastify.route({
    method: 'GET',
    path: '/:id',
    config: {
      public: false,
      permission,
    },
    schema: {
      summary: 'Get activity',
      description: buildRouteFullDescription({
        description: routeDescription,
        errors,
        permission,
        api: 'read',
      }),
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.string().format('uuid'))
        .description('Activity id.')
        .required(),
      response: {
        200: sActivityDetail(),
        404: fastify.getSchema('sNotFound'),
      },
    },
    preHandler: onPreHandler,
    handler: onReadActivity,
  })

  async function onPreHandler(req) {
    const { id } = req.params
    const { id: userId, email, apiPermission } = req.user

    const activity = await massive.activity.findOne(id)
    if (!activity) {
      throwNotFoundError({ id, name: 'activity' })
    }

    if (restrictDataToOwner(apiPermission) && activity.ownerId !== userId) {
      throwOwnershipError({ id: userId, email })
    }

    req.resource = activity
  }

  async function onReadActivity(req) {
    const { resource: activity } = req
    const { id: ownerId } = req.user

    return populateActivity(activity, ownerId, massive)
  }
}
