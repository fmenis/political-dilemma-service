import S from 'fluent-json-schema'

import {
  buildRouteFullDescription,
  restrictDataToOwner,
} from '../../common/common.js'
import { ACTIVITY_STATES } from '../../common/enums.js'

export default async function deleteActivity(fastify) {
  const { massive } = fastify
  const {
    errors,
    throwNotFoundError,
    throwOwnershipError,
    throwInvalidStatusError,
  } = fastify.activityErrors

  const routeDescription = 'Delete activity.'
  const permission = 'activity:delete'

  fastify.route({
    method: 'DELETE',
    path: '/:id',
    config: {
      public: false,
      permission,
    },
    schema: {
      summary: 'Delete activity',
      description: buildRouteFullDescription({
        description: routeDescription,
        errors,
        permission,
        api: 'delete',
      }),
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.string().format('uuid'))
        .description('Activity id.')
        .required(),
      response: {
        204: fastify.getSchema('sNoContent'),
        404: fastify.getSchema('sNotFound'),
        409: fastify.getSchema('sConflict'),
      },
    },
    preHandler: onPreHandler,
    handler: onDeleteActivity,
  })

  async function onPreHandler(req) {
    const { id } = req.params

    const { id: userId, email, apiPermission } = req.user

    const activity = await massive.activity.findOne(id, {
      fields: ['id', 'status', 'ownerId'],
    })
    if (!activity) {
      throwNotFoundError({ id, name: 'activity' })
    }

    if (restrictDataToOwner(apiPermission) && activity.ownerId !== userId) {
      throwOwnershipError({ id: userId, email })
    }

    if (activity.status !== ACTIVITY_STATES.DRAFT) {
      throwInvalidStatusError({
        id,
        requiredStatus: ACTIVITY_STATES.DRAFT,
      })
    }
  }

  async function onDeleteActivity(req, reply) {
    const { id } = req.params

    await massive.activity.destroy(id)
    reply.code(204)
  }
}
