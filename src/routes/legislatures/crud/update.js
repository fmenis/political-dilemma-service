import dayjs from 'dayjs'
import S from 'fluent-json-schema'

import { sUpdateLegislature, sLegislatureDetail } from '../lib/schema.js'
import { buildRouteFullDescription } from '../../common/common.js'

export default async function updateLegislature(fastify) {
  const { massive } = fastify
  const {
    throwNotFoundError,
    throwDuplicatedNameError,
    throwInvalidDatesError,
    errors,
  } = fastify.legislatureErrors

  const routeDescription = 'Update legislature.'
  const api = 'update'
  const permission = `legislature:${api}`

  fastify.route({
    method: 'PATCH',
    path: '/:id',
    config: {
      public: false,
      permission,
      trimBodyFields: ['name'],
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
      body: sUpdateLegislature(),
      response: {
        200: sLegislatureDetail(),
        404: fastify.getSchema('sNotFound'),
        409: fastify.getSchema('sConflict'),
      },
    },
    preHandler: onPreHandler,
    handler: onUpdateLegislature,
  })

  async function onPreHandler(req) {
    const { id } = req.params
    const { name, startDate, endDate } = req.body

    if (!(await massive.legislature.findOne(id))) {
      throwNotFoundError({ id })
    }

    if (name) {
      const nameDuplicates = await massive.legislature.where(
        'LOWER(name) = TRIM(LOWER($1))',
        [`${name.trim()}`]
      )
      if (nameDuplicates.length) {
        throwDuplicatedNameError({ name })
      }
    }

    if (
      startDate &&
      endDate &&
      (dayjs(startDate).isAfter(dayjs(endDate)) ||
        dayjs(startDate).isSame(dayjs(endDate)))
    ) {
      throwInvalidDatesError({ startDate, endDate })
    }
  }

  async function onUpdateLegislature(req, reply) {
    const { id } = req.params

    const updatedLegislature = await massive.legislature.update(id, req.body)

    reply.code(200).send({
      ...updatedLegislature,
      ministries: [],
    })
  }
}
