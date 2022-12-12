import { sCreateActivity, sActivityDetail } from '../lib/activity.schema.js'
import { buildRouteFullDescription } from '../../lib/common.js'
//TODO siccome comuni anche agli articoli, spostartli in posto unico
import { ARTICLE_STATES } from '../../articles/lib/enums.js'

export default async function createActivity(fastify) {
  const { massive } = fastify
  const { errors } = fastify.activityErrors

  const routeDescription = 'Create activity.'
  const permission = 'activity:create'

  fastify.route({
    method: 'POST',
    path: '/',
    config: {
      public: false,
      permission,
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
      },
    },
    preValidation: onPreValidation,
    preHandler: onPreHandler,
    handler: onCreateActivity,
  })

  async function onPreValidation() {
    //TODO implementare trim
  }

  async function onPreHandler() {
    //TODO implementare validazioni
  }

  async function onCreateActivity(req, reply) {
    const { title, text, description, categoryId, type, tags } = req.body
    const { user } = req

    const params = {
      title,
      text,
      categoryId,
      type,
      description,
      status: ARTICLE_STATES.DRAFT,
      ownerId: user.id,
      tags,
    }

    const newActivity = await massive.activity.save(params)

    reply.resourceId = newActivity.id
    reply.code(201)

    return newActivity
  }
}
