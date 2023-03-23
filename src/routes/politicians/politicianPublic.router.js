import S from 'fluent-json-schema'

import { sPolitician } from './lib/politician.schema.js'
import { buildRouteFullDescription } from '../common/common.js'

export default async function politicianPublicRouter(fastify) {
  const { politicianErrors, politicianController } = fastify

  const { errors } = politicianErrors
  const publicApi = true

  fastify.route({
    method: 'GET',
    path: '/',
    config: {
      public: publicApi,
    },
    schema: {
      summary: 'List politicians',
      description: buildRouteFullDescription({
        description: 'List politicians',
        errors,
        api: 'list',
        publicApi,
      }),
      query: S.object()
        .additionalProperties(false)
        .prop('userId', S.string().format('uuid'))
        .description('Retrieve user sessions.')
        .prop('active', S.boolean())
        .description('Retrieve only active sessions.'),
      response: {
        200: S.array().maxItems(200).items(sPolitician()),
      },
    },
    handler: politicianController.list,
  })
}
