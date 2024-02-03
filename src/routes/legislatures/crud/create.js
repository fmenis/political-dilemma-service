import { sCreateLegislature, sLegislatureDetail } from '../lib/schema.js'
import { buildRouteFullDescription } from '../../common/common.js'

export default async function createLegislature(fastify) {
  const { massive } = fastify
  const { throwDuplicatedNameError, errors } = fastify.legislatureErrors

  const routeDescription = 'Create legislature.'
  const permission = 'legislature:create'

  fastify.route({
    method: 'POST',
    path: '/',
    config: {
      public: false,
      permission,
      trimBodyFields: ['name'],
    },
    schema: {
      summary: 'Create legislature',
      description: buildRouteFullDescription({
        description: routeDescription,
        errors,
        permission,
        api: 'create',
      }),
      body: sCreateLegislature(),
      response: {
        201: sLegislatureDetail(),
        409: fastify.getSchema('sConflict'),
      },
    },
    preHandler: onPreHandler,
    handler: onCreateLegislature,
  })

  async function onPreHandler(req) {
    const { name } = req.body

    const nameDuplicates = await massive.legislature.where(
      'LOWER(name) = TRIM(LOWER($1))',
      [`${name.trim()}`]
    )
    if (nameDuplicates.length) {
      throwDuplicatedNameError({ name })
    }
  }

  async function onCreateLegislature(req, reply) {
    const { name, startDate, endDate } = req.body

    const newLegislature = await massive.legislature.save({
      name,
      startDate,
      endDate,
    })

    reply.code(201).send({
      ...newLegislature,
      ministries: [],
    })
  }
}
