import S from 'fluent-json-schema'

import { sPoliticianDetail } from './lib/schema.js'
import { buildRouteFullDescription } from '../common/common.js'

export default async function readPolitician(fastify) {
  const { massive, politicianErrors } = fastify
  const { throwNotFoundError, errors } = politicianErrors

  const api = 'read'
  const permission = `politician:${api}`

  fastify.route({
    method: 'GET',
    path: '/:id',
    config: {
      public: false,
      permission,
    },
    schema: {
      summary: 'Read politician',
      description: buildRouteFullDescription({
        description: 'Read politician.',
        errors,
        permission,
        api,
      }),
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.string().format('uuid'))
        .description('Politician id.')
        .required(),
      response: {
        200: sPoliticianDetail(),
        404: fastify.getSchema('sNotFound'),
      },
    },
    preHandler: onPreHandler,
    handler: onReadPolitician,
  })

  async function onPreHandler(req) {
    const { id } = req.params

    const politician = await massive.politician.findOne(id)
    if (!politician) {
      throwNotFoundError({ id, name: 'politician' })
    }

    req.resource = politician
  }

  async function onReadPolitician(req) {
    const { resource: politician } = req

    return { ...politician, rating: 0 }
  }
}
