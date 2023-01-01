import S from 'fluent-json-schema'

import {
  buildRouteFullDescription,
  restrictDataToOwner,
  isFutureDate,
} from '../../common/common.js'
import { sUpdateActivity, sActivityDetail } from '../lib/activity.schema.js'
import { getShortType, populateActivity } from '../lib/common.js'
import { removeObjectProps } from '../../../utils/main.js'
import { ACTIVITY_STATES } from '../../common/enums.js'
import { CATEGORIES } from '../../files/lib/enums.js'

export default async function updateActivity(fastify) {
  const { massive } = fastify
  const {
    errors,
    throwNotFoundError,
    throwInvalidCategoryError,
    // throwDuplicateTitleError,
    throwOwnershipError,
    throwInvalidPubblicazioneInGazzettaDateError,
    throwInvalidStatusError,
    throwAttachmentsNotFoundError,
  } = fastify.activityErrors

  const routeDescription = 'Update activity.'
  const permission = 'activity:update'

  fastify.route({
    method: 'PATCH',
    path: '/:id',
    config: {
      public: false,
      permission,
      trimBodyFields: ['title', 'text', 'description', 'tags'],
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
        409: fastify.getSchema('sConflict'),
      },
    },
    preHandler: onPreHandler,
    handler: onUpdateActivity,
  })

  async function onPreHandler(req) {
    const { id } = req.params
    const {
      categoryId,
      /*title,*/ dataPubblicazioneInGazzetta,
      attachmentIds,
    } = req.body
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

    if (
      activity.status !== ACTIVITY_STATES.DRAFT ||
      activity.status !== ACTIVITY_STATES.IN_REVIEW ||
      activity.status !== ACTIVITY_STATES.REWORK
    ) {
      throwInvalidStatusError({
        id,
        requiredStatus: `${ACTIVITY_STATES.DRAFT}, ${ACTIVITY_STATES.IN_REVIEW} or ${ACTIVITY_STATES.REWORK}`,
      })
    }

    if (categoryId) {
      const category = await massive.categories.findOne(categoryId)
      if (!category) {
        throwNotFoundError({ id: categoryId, name: 'category' })
      }
      if (category.type !== 'ACTIVITY') {
        throwInvalidCategoryError({ id: categoryId, type: category.type })
      }
    }

    //TODO dev'essere diverso da se stesso
    // if (title) {
    //   const titleDuplicates = await massive.activity.where(
    //     'LOWER(title) = TRIM(LOWER($1))',
    //     [`${title.trim()}`]
    //   )

    //   const flag = titleDuplicates.some(item => {
    //     const res = item.title.toLowerCase() === title.trim().toLowerCase()
    //     return res
    //   })

    //   if (flag) {
    //     throwDuplicateTitleError({ title })
    //   }
    // }

    if (
      dataPubblicazioneInGazzetta &&
      isFutureDate(dataPubblicazioneInGazzetta)
    ) {
      throwInvalidPubblicazioneInGazzettaDateError({
        dataPubblicazioneInGazzetta,
      })
    }

    if (attachmentIds) {
      const files = await massive.files.find({
        id: attachmentIds,
        category: CATEGORIES.ACTIVITY_IMAGE,
      })
      if (files.length < attachmentIds.length) {
        throwAttachmentsNotFoundError({ attachmentIds, files })
      }
    }
  }

  async function onUpdateActivity(req) {
    const { id } = req.params
    const { attachmentIds } = req.body
    const { id: currentUserId } = req.user

    const updatedActivity = await massive.withTransaction(async tx => {
      const updatedActivity = await tx.activity.update(
        id,
        buildUpdateParams(req.body)
      )

      if (attachmentIds?.length) {
        // remove and re-assign all activity reference of the files
        await tx.files.update(
          {
            activityId: updatedActivity.id,
          },
          {
            activityId: null,
          }
        )

        await Promise.all(
          attachmentIds.map(attachmentId => {
            tx.files.save({ id: attachmentId, activityId: updatedActivity.id })
          })
        )
      }

      if (attachmentIds === null) {
        await tx.files.destroy({ activityId: updatedActivity.id })
      }

      return updatedActivity
    })

    return populateActivity(updatedActivity, currentUserId, massive)
  }

  function buildUpdateParams(body) {
    let params = {
      ...removeObjectProps(body, ['attachmentIds']),
      updatedAt: new Date(),
    }

    if (body.type) {
      params = {
        ...params,
        shortType: getShortType(body.type),
      }
    }

    return params
  }
}
