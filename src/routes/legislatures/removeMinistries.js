import S from 'fluent-json-schema'

import { buildRouteFullDescription } from '../common/common.js'
import { populateLegislature } from './lib/common.js'

export default async function removeMinistries(fastify) {
  const { massive } = fastify
  const { throwNotFoundError, errors } = fastify.legislatureErrors

  const routeDescription = 'Remove ministries.'
  const api = 'remove-ministries'
  const permission = `legislature:${api}`

  fastify.route({
    method: 'DELETE',
    path: '/:id/ministries',
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
        .prop(
          'ids',
          S.array(S.string().format('uuid')).minItems(1).uniqueItems(true)
        )
        .description('Ministries ids.')
        .required(),
      response: {
        204: fastify.getSchema('sNoContent'),
        404: fastify.getSchema('sNotFound'),
        // 409: fastify.getSchema('sConflict'),
      },
    },
    preHandler: onPreHandler,
    handler: onRemoveMinistries,
  })

  async function onPreHandler(req) {
    const { id } = req.params

    const legislature = await massive.legislature.findOne(id)

    if (!legislature) {
      throwNotFoundError({ id })
    }

    //##TODO check ministers not present

    req.resource = legislature
  }

  async function onRemoveMinistries(req) {
    const { ids } = req.body
    const { resource: legislature } = req

    await massive.ministry.destroy({ id: ids })

    return populateLegislature(legislature, massive)
  }
}
