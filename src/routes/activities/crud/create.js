import { sCreateActivity, sActivityDetail } from '../lib/activity.schema.js'
import { buildRouteFullDescription, isFutureDate } from '../../common/common.js'
import { ACTIVITY_STATES } from '../../common/enums.js'
import { getShortType } from '../lib/common.js'

export default async function createActivity(fastify) {
  const { massive } = fastify
  const {
    errors,
    throwNotFoundError,
    throwInvalidCategoryError,
    throwDuplicateTitleError,
    throwInvalidPubblicazioneInGazzettaDateError,
  } = fastify.activityErrors

  const routeDescription = 'Create activity.'
  const permission = 'activity:create'

  fastify.route({
    method: 'POST',
    path: '/',
    config: {
      public: false,
      permission,
      trimBodyFields: ['title', 'text', 'description', 'tags'],
    },
    schema: {
      summary: 'Create activity',
      description: buildRouteFullDescription({
        description: routeDescription,
        errors,
        permission,
        api: 'create',
      }),
      body: sCreateActivity(),
      response: {
        201: sActivityDetail(),
        404: fastify.getSchema('sNotFound'),
        409: fastify.getSchema('sConflict'),
      },
    },
    preHandler: onPreHandler,
    handler: onCreateActivity,
  })

  async function onPreHandler(req) {
    const { categoryId, title, dataPubblicazioneInGazzetta } = req.body

    const category = await massive.categories.findOne(categoryId)
    if (!category) {
      throwNotFoundError({ id: categoryId, name: 'category' })
    }
    if (category.type !== 'ACTIVITY') {
      throwInvalidCategoryError({ id: categoryId, type: category.type })
    }

    const titleDuplicates = await massive.activity.where(
      'LOWER(title) = TRIM(LOWER($1))',
      [`${title.trim()}`]
    )
    if (titleDuplicates.length > 0) {
      throwDuplicateTitleError({ title })
    }

    if (
      dataPubblicazioneInGazzetta &&
      isFutureDate(dataPubblicazioneInGazzetta)
    ) {
      throwInvalidPubblicazioneInGazzettaDateError({
        dataPubblicazioneInGazzetta,
      })
    }
  }

  async function onCreateActivity(req, reply) {
    const { user } = req
    const { attachmentIds = [] } = req.body

    const params = {
      ...req.body,
      status: ACTIVITY_STATES.DRAFT,
      ownerId: user.id,
      shortType: getShortType(req.body.type),
    }

    const newActivity = await massive.withTransaction(async tx => {
      const newActivity = await tx.activity.save(params)

      await Promise.all(
        attachmentIds.map(attachmentId => {
          tx.files.save({ id: attachmentId, activityId: newActivity.id })
        })
      )

      return newActivity
    })

    const owner = await massive.users.findOne(user.id)

    reply.resourceId = newActivity.id
    reply.code(201)

    // fare in modo che torni già populateArticle

    return {
      ...newActivity,
      author: `${owner.first_name} ${owner.last_name}`,
    }
  }
}
