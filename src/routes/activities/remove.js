import S from 'fluent-json-schema'

import { ACTIVITY_STATES } from '../common/enums.js'
import { populateActivity } from './lib/common.js'
import { buildRouteFullDescription } from '../common/common.js'
import { sActivityDetail } from './lib/activity.schema.js'

export default async function removeActivity(fastify) {
  const { massive } = fastify
  const { throwNotFoundError, throwInvalidStatusError, errors } =
    fastify.activityErrors

  const routeDescription = 'Request to remove an activity.'
  const permission = 'activity:remove'

  fastify.route({
    method: 'POST',
    path: '/:id/remove',
    config: {
      public: false,
      permission,
      trimBodyFields: ['cancellationReason'],
    },
    schema: {
      summary: 'Remove activity',
      description: buildRouteFullDescription({
        description: routeDescription,
        errors,
        permission,
        api: 'remove',
      }),
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.string().format('uuid'))
        .description('Activity id.')
        .required(),
      body: S.object()
        .additionalProperties(false)
        .prop('cancellationReason', S.string().minLength(3).maxLength(250))
        .description('Activity cancellation reason.')
        .required(),
      response: {
        200: sActivityDetail(),
        404: fastify.getSchema('sNotFound'),
        409: fastify.getSchema('sConflict'),
      },
    },
    preHandler: onPreHandler,
    handler: onRemoveActivity,
  })

  async function onPreHandler(req) {
    const { id } = req.params

    const activity = await massive.activity.findOne(id)
    if (!activity) {
      throwNotFoundError({ id })
    }

    if (
      activity.status === ACTIVITY_STATES.DRAFT ||
      activity.status === ACTIVITY_STATES.ARCHIVED ||
      activity.status === ACTIVITY_STATES.DELETEDY
    ) {
      throwInvalidStatusError({
        id,
        requiredStatus: `not ${ACTIVITY_STATES.DRAFT},  ${ACTIVITY_STATES.ARCHIVED} or ${ACTIVITY_STATES.DELETED}`,
      })
    }

    req.activity = activity
  }

  async function onRemoveActivity(req) {
    const { activity } = req
    const { cancellationReason } = req.body
    const { id: currentUserId } = req.user

    const updatedActivity = {
      ...activity,
      status: ACTIVITY_STATES.DELETED,
      cancellationReason,
      updatedAt: new Date(),
    }

    await massive.activity.update(updatedActivity.id, updatedActivity)

    return populateActivity(updatedActivity, currentUserId, massive)
  }
}
