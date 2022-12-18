import { sCreateActivity, sActivityDetail } from '../lib/activity.schema.js'
import { buildRouteFullDescription } from '../../common/common.js'
import { ACTIVITY_STATES } from '../../common/enums.js'
import { findArrayDuplicates } from '../../../utils/main.js'
import { getShortType } from '../lib/common.js'

export default async function createActivity(fastify) {
  const { massive } = fastify
  const {
    errors,
    throwNotFoundError,
    throwInvalidCategoryError,
    throwDuplicateTitleError,
    throwDuplicateTagsError,
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
      description: buildRouteFullDescription(
        routeDescription,
        errors,
        permission,
        'create'
      ),
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
    const { categoryId, title, tags = [] } = req.body

    const category = await massive.categories.findOne(categoryId)
    if (!category) {
      throwNotFoundError({ id: categoryId, name: 'category' })
    }
    if (category.type !== 'ACTIVITY') {
      throwInvalidCategoryError({ id: categoryId, type: category.type })
    }

    const duplicates = await massive.activity.where(
      'LOWER(title) = TRIM(LOWER($1))',
      [`${title.trim()}`]
    )
    if (duplicates.length > 0) {
      throwDuplicateTitleError({ title })
    }

    const duplicatedTags = findArrayDuplicates(tags)
    if (duplicatedTags.length) {
      throwDuplicateTagsError({ duplicatedTags })
    }
  }

  async function onCreateActivity(req, reply) {
    const { user } = req

    //TODO mock error
    // delete req.body.type

    try {
      const params = {
        ...req.body,
        status: ACTIVITY_STATES.DRAFT,
        ownerId: user.id,
        shortType: getShortType(req.body.type),
      }

      const [newActivity, owner] = await Promise.all([
        massive.activity.save(params),
        massive.users.findOne(user.id, { fields: ['first_name', 'last_name'] }),
      ])

      reply.resourceId = newActivity.id
      reply.code(201)

      return {
        ...newActivity,
        author: `${owner.first_name} ${owner.last_name}`,
      }
    } catch (error) {
      //TODO capire perchè questo tipo di errori viene loggato 2 volte su sentry
      reply.code(500)
      throw error
    }
  }
}
