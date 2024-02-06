import S from 'fluent-json-schema'

import { sLegislatureDetail } from '../lib/schema.js'
import { buildRouteFullDescription } from '../../common/common.js'
import { populateLegislature } from '../lib/common.js'

export default async function readLegislature(fastify) {
  const { massive } = fastify
  const { throwNotFoundError, errors } = fastify.legislatureErrors

  const routeDescription = 'Read legislature.'
  const api = 'read'
  const permission = `legislature:${api}`

  fastify.route({
    method: 'GET',
    path: '/:id',
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
        200: sLegislatureDetail(),
        404: fastify.getSchema('sNotFound'),
      },
    },
    preHandler: onPreHandler,
    handler: onReadLegislature,
  })

  async function onPreHandler(req) {
    const { id } = req.params

    const legislature = await massive.legislature.findOne(id)
    if (!legislature) {
      throwNotFoundError({ id })
    }

    req.resource = legislature
  }

  async function onReadLegislature(req) {
    const { resource: legislature } = req
    return populateLegislature(legislature, massive)
  }
}
