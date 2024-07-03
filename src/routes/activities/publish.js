import S from 'fluent-json-schema'

import { ACTIVITY_STATES, CATEGORY_TYPES } from '../common/enums.js'
import { populateActivity } from './lib/common.js'
import { buildRouteFullDescription } from '../common/common.js'
import { sActivityDetail } from './lib/activity.schema.js'

export default async function publishActivity(fastify) {
  const { massive } = fastify
  const { throwNotFoundError, throwInvalidStatusError, errors } =
    fastify.activityErrors

  const routeDescription = 'Request to publish an activity.'
  const permission = 'activity:publish'

  fastify.route({
    method: 'POST',
    path: '/:id/publish',
    config: {
      public: false,
      permission,
      trimBodyFields: ['note'],
    },
    schema: {
      summary: 'Publish activity',
      description: buildRouteFullDescription({
        description: routeDescription,
        errors,
        permission,
        api: 'publish',
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
    handler: onPublishActivity,
  })

  async function onPreHandler(req) {
    const { id } = req.params

    const activity = await massive.activity.findOne(id)
    if (!activity) {
      throwNotFoundError({ id, name: 'activity' })
    }

    if (activity.status !== ACTIVITY_STATES.READY) {
      throwInvalidStatusError({
        id,
        requiredStatus: `${ACTIVITY_STATES.READY}`,
      })
    }

    req.resource = activity
  }

  async function onPublishActivity(req) {
    const { resource: activity } = req
    const { id: ownerId } = req.user
    const { note } = req.body

    const updatedActivity = {
      ...activity,
      status: ACTIVITY_STATES.PUBLISHED,
      publishedAt: new Date(),
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
