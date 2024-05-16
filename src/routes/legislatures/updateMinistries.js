import S from 'fluent-json-schema'

import { sLegislatureDetail } from './lib/schema.js'
import { buildRouteFullDescription } from '../common/common.js'
import { populateLegislature } from './lib/common.js'
import { removeObjectNullishProps } from '../../utils/main.js'

export default async function updateMinistry(fastify) {
  const { massive } = fastify
  const { throwNotFoundError, errors } = fastify.legislatureErrors

  const routeDescription = 'Update ministries.'
  const api = 'update-ministries'
  const permission = `legislature:${api}`

  fastify.route({
    method: 'PATCH',
    path: '/:id/update-ministries',
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
          'ministries',
          S.array(
            S.object()
              .additionalProperties(false)
              .prop('id', S.string().format('uuid'))
              .description('Ministry id.')
              .required()
              .prop('name', S.string().minLength(2).maxLength(50))
              .description('Ministry name.')
              .prop('ministerFullName', S.string().minLength(2).maxLength(100))
              .description('Minister name.')
          )
            .minItems(1)
            .uniqueItems(true)
        ),
      response: {
        200: sLegislatureDetail(),
        404: fastify.getSchema('sNotFound'),
        409: fastify.getSchema('sConflict'),
      },
    },
    preHandler: onPreHandler,
    handler: onUpdateMinistry,
  })

  async function onPreHandler(req) {
    const { id } = req.params

    const legislature = await massive.legislature.findOne(id)

    if (!legislature) {
      throwNotFoundError({ id })
    }

    //##TODO if check name and ministerFullName already used

    req.resource = legislature
  }

  async function onUpdateMinistry(req) {
    const { ministries } = req.body
    const { resource: legislature } = req

    await Promise.all(
      ministries.map(
        async minister =>
          await massive.ministry.update(minister.id, {
            ...removeObjectNullishProps(minister),
            updatedAt: new Date(),
          })
      )
    )

    return populateLegislature(legislature, massive)
  }
}
