import S from 'fluent-json-schema'

import { ACTIVITY_STATES, CATEGORY_TYPES } from '../common/enums.js'
import { populateActivity } from './lib/common.js'
import { buildRouteFullDescription } from '../common/common.js'
import { sActivityDetail } from './lib/activity.schema.js'

export default async function reviewActivity(fastify) {
  const { massive } = fastify
  const {
    throwNotFoundError,
    throwInvalidStatusError,
    throwMissinDataError,
    errors,
  } = fastify.activityErrors

  const routeDescription = 'Request to review an activity.'
  const permission = 'activity:review'

  fastify.route({
    method: 'POST',
    path: '/:id/review',
    config: {
      public: false,
      permission,
      trimBodyFields: ['note'],
    },
    schema: {
      summary: 'Review activity',
      description: buildRouteFullDescription({
        description: routeDescription,
        errors,
        permission,
        api: 'review',
      }),
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.string().format('uuid'))
        .description('Activity id.')
        .required(),
      body: S.object()
        .additionalProperties(false)
        .prop('note', S.string().minLength(3).maxLength(250))
        .description('Activity note.'),
      response: {
        200: sActivityDetail(),
        404: fastify.getSchema('sNotFound'),
        409: fastify.getSchema('sConflict'),
      },
    },
    preHandler: onPreHandler,
    handler: onReviewActivity,
  })

  async function onPreHandler(req) {
    const { id } = req.params

    const activity = await massive.activity.findOne(id)
    if (!activity) {
      throwNotFoundError({ id })
    }

    if (
      activity.status !== ACTIVITY_STATES.DRAFT &&
      activity.status !== ACTIVITY_STATES.REWORK
    ) {
      throwInvalidStatusError({
        id,
        requiredStatus: `${ACTIVITY_STATES.DRAFT} or ${ACTIVITY_STATES.REWORK}`,
      })
    }

    if (!activity.description || !activity.text) {
      const errors = []

      if (!activity.description) {
        errors.push({
          internalCode: 'MISSING_DESCRIPTION',
          message: `Invalid action on activity '${id}'. The description must be provided`,
        })
      }

      if (!activity.text) {
        errors.push({
          internalCode: 'MISSING_TEXT',
          message: `Invalid action on activity '${id}'. The text must be provided`,
        })
      }

      throwMissinDataError({ id, errors })
    }

    req.activity = activity
  }

  async function onReviewActivity(req) {
    const { activity } = req
    const { id: ownerId } = req.user
    const { note } = req.body

    const updatedActivity = {
      ...activity,
      status: ACTIVITY_STATES.IN_REVIEW,
      updatedAt: new Date(),
    }

    await massive.withTransaction(async tx => {
      await tx.activity.update(updatedActivity.id, updatedActivity)

      if (note) {
        await tx.internalNotes.save({
          ownerId,
          text: note,
          activityId: updatedActivity.id,
          category: CATEGORY_TYPES.ACTIVITY,
        })
      }
    })

    return populateActivity(updatedActivity, ownerId, massive)
  }
}
