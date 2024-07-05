import S from 'fluent-json-schema'

import { buildRouteFullDescription } from '../common/common.js'
import { sLegislatureDetail } from './lib/schema.js'

export default async function duplicateLegislature(fastify) {
  const { massive } = fastify
  const { throwNotFoundError, throwDuplicatedNameError, errors } =
    fastify.legislatureErrors

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
      body: S.object()
        .additionalProperties(false)
        .prop('name', S.string().minLength(3).maxLength(50))
        .description('Legislature name.')
        .required(),
      response: {
        200: sLegislatureDetail(),
        404: fastify.getSchema('sNotFound'),
        409: fastify.getSchema('sConflict'),
      },
    },
    preHandler: onPreHandler,
    handler: onDuplicateLegislature,
  })

  async function onPreHandler(req) {
    const { id } = req.params
    const { name } = req.body

    const legislature = await massive.legislature.findOne(id)

    if (!legislature) {
      throwNotFoundError({ id })
    }

    const nameDuplicates = await massive.legislature.where(
      'LOWER(name) = TRIM(LOWER($1))',
      [`${name.trim()}`]
    )
    if (nameDuplicates.length) {
      throwDuplicatedNameError({ name })
    }

    req.resource = legislature
  }

  async function onDuplicateLegislature(req) {
    const { resource: legislature } = req
    const { name } = req.body

    const ministries = await massive.ministry.find(
      {
        legislatureId: legislature.id,
      },
      { fields: ['name', 'politicianId'] }
    )

    const newLegislature = await massive.withTransaction(async tx => {
      const newLegislature = await tx.legislature.save({
        name,
        startDate: legislature.startDate,
        endDate: legislature.endDate,
      })

      await tx.ministry.insert(
        ministries.map(item => ({
          ...item,
          legislatureId: newLegislature.id,
        }))
      )

      return newLegislature
    })

    return {
      ...newLegislature,
      ministries: [],
    }
  }
}
