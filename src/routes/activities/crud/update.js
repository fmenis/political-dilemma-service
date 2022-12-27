import S from 'fluent-json-schema'

import {
  buildRouteFullDescription,
  restrictDataToOwner,
} from '../../common/common.js'
import { sUpdateActivity, sActivityDetail } from '../lib/activity.schema.js'

export default async function updateActivity(fastify) {
  const { massive } = fastify
  const {
    errors,
    throwNotFoundError,
    // throwInvalidCategoryError,
    // throwDuplicateTitleError,
    throwOwnershipError,
    // throwInvalidPubblicazioneInGazzettaDateError,
  } = fastify.activityErrors

  const routeDescription = 'Update activity.'
  const permission = 'activity:update'

  fastify.route({
    method: 'PATCH',
    path: '/:id',
    config: {
      public: false,
      permission,
    },
    schema: {
      summary: 'Update activity',
      description: buildRouteFullDescription({
        description: routeDescription,
        errors,
        permission,
        api: 'update',
      }),
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.string().format('uuid'))
        .description('Activity id.')
        .required(),
      body: sUpdateActivity(),
      response: {
        200: sActivityDetail(),
        404: fastify.getSchema('sNotFound'),
      },
    },
    preHandler: onPreHandler,
    handler: onUpdateActivity,
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

    req.activity = activity
  }

  async function onUpdateActivity() {
    // se cambia il type, impostare anche il relativo shortType
  }
}
