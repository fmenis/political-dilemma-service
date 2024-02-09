import S from 'fluent-json-schema'

import { sMinistryDetail } from './lib/schema.js'
import { buildRouteFullDescription } from '../common/common.js'

export default async function updateMinistry(fastify) {
  const { massive } = fastify
  const { throwNotFoundError, errors } = fastify.legislatureErrors

  const routeDescription = 'Update ministry.'
  const api = 'update-ministry'
  const permission = `legislature:${api}`

  fastify.route({
    method: 'PATCH',
    path: '/:id/ministries/:ministryId',
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
        .required()
        .prop('ministryId', S.string().format('uuid'))
        .description('Ministry id.')
        .required(),
      body: S.object()
        .additionalProperties(false)
        .prop('name', S.string().minLength(2).maxLength(50))
        .description('Ministry name.')
        .prop('ministerFullName', S.string().minLength(2).maxLength(100))
        .description('Minister name.'),
      response: {
        200: sMinistryDetail(),
        404: fastify.getSchema('sNotFound'),
        409: fastify.getSchema('sConflict'),
      },
    },
    preHandler: onPreHandler,
    handler: onUpdateMinistry,
  })

  async function onPreHandler(req) {
    const { id, ministryId } = req.params
    // const { name, ministerFullName } = req.body

    if (!(await massive.legislature.findOne(id))) {
      throwNotFoundError({ id })
    }

    if (!(await massive.ministry.findOne(ministryId))) {
      throwNotFoundError({ id, entity: 'ministry' })
    }

    //##TODO if check name and ministerFullName already used
  }

  async function onUpdateMinistry(req) {
    const { ministryId } = req.params

    const { id, name, ministerFullName } = await massive.ministry.update(
      ministryId,
      {
        ...req.body,
        updatedAt: new Date(),
      }
    )

    return {
      id,
      name,
      ministerFullName,
    }
  }
}
