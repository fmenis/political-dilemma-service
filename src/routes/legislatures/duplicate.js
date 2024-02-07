import S from 'fluent-json-schema'

import { buildRouteFullDescription } from '../common/common.js'

export default async function duplicateLegislature(fastify) {
  const { massive } = fastify
  const { throwNotFoundError, errors } = fastify.legislatureErrors

  const routeDescription = 'Duplicate legislature.'
  const api = 'duplicate'
  const permission = `legislature:${api}`

  fastify.route({
    method: 'POST',
    path: '/:id/duplicate',
    config: {
      public: false,
      permission,
    },
    schema: {
      summary: routeDescription,
      description: buildRouteFullDescription({
        description: routeDescription,
        errors,
        permission,
        api,
      }),
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.string().format('uuid'))
        .description('Legislature id.')
        .required(),
      response: {
        204: fastify.getSchema('sNoContent'),
        404: fastify.getSchema('sNotFound'),
      },
    },
    preHandler: onPreHandler,
    handler: onDuplicateLegislature,
  })

  async function onPreHandler(req) {
    const { id } = req.params

    const legislature = await massive.legislature.findOne(id)
    if (!legislature) {
      throwNotFoundError({ id })
    }

    req.resource = legislature
  }

  async function onDuplicateLegislature(req, reply) {
    const { resource: legislature } = req

    const ministries = await massive.ministry.find(
      {
        legislatureId: legislature.id,
      },
      { fields: ['name', 'ministerFullName'] }
    )

    await massive.withTransaction(async tx => {
      const newLegislature = await tx.legislature.save({
        name: `${legislature.name} copy_${new Date().getMilliseconds()}`,
        startDate: legislature.startDate,
        endDate: legislature.endDate,
      })

      await tx.ministry.insert(
        ministries.map(item => ({
          ...item,
          legislatureId: newLegislature.id,
        }))
      )
    })

    reply.code(204)
  }
}
