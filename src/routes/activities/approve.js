import S from 'fluent-json-schema'

import { ACTIVITY_STATES, CATEGORY_TYPES } from '../common/enums.js'
import { populateActivity } from './lib/common.js'
import { buildRouteFullDescription } from '../common/common.js'
import { sActivityDetail } from './lib/activity.schema.js'
import { isPastDate } from '../common/common.js'

export default async function approveActivity(fastify) {
  const { massive } = fastify
  const {
    throwNotFoundError,
    throwInvalidStatusError,
    throwInvalidPublicationDateError,
    errors,
  } = fastify.activityErrors

  const routeDescription = 'Request to approve an activity.'
  const permission = 'activity:approve'

  fastify.route({
    method: 'POST',
    path: '/:id/approve',
    config: {
      public: false,
      permission,
      trimBodyFields: ['note'],
    },
    schema: {
      summary: 'Approve activity',
      description: buildRouteFullDescription({
        description: routeDescription,
        errors,
        permission,
        api: 'approve',
      }),
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.string().format('uuid'))
        .description('Activity id.')
        .required(),
      body: S.object()
        .additionalProperties(false)
        .prop('note', S.string().minLength(3).maxLength(250))
        .description('Activity note.')
        .prop('publicationDate', S.string().format('date-time'))
        .description('Activity publication date.')
        .required(),
      response: {
        200: sActivityDetail(),
        404: fastify.getSchema('sNotFound'),
        409: fastify.getSchema('sConflict'),
      },
    },
    preHandler: onPreHandler,
    handler: onApproveActivity,
  })

  async function onPreHandler(req) {
    const { id } = req.params
    const { publicationDate } = req.body

    const activity = await massive.activity.findOne(id)
    if (!activity) {
      throwNotFoundError({ id })
    }

    if (activity.status !== ACTIVITY_STATES.IN_REVIEW) {
      throwInvalidStatusError({ id, requiredStatus: ACTIVITY_STATES.IN_REVIEW })
    }

    if (isPastDate(publicationDate)) {
      throwInvalidPublicationDateError({ publicationDate })
    }

    req.activity = activity
  }

  async function onApproveActivity(req) {
    const { activity } = req
    const { id: ownerId } = req.user
    const { note, publicationDate } = req.body

    const updatedActivity = {
      ...activity,
      status: ACTIVITY_STATES.READY,
      publishedAt: publicationDate,
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
