import S from 'fluent-json-schema'

import { buildRouteFullDescription } from '../common/common.js'

export default async function getPoliticianNames(fastify) {
  const { massive } = fastify

  fastify.route({
    method: 'GET',
    path: '/names',
    config: {
      public: false,
    },
    schema: {
      summary: 'List politician names',
      description: buildRouteFullDescription({
        description: 'List politician names',
      }),
      response: {
        200: S.object()
          .additionalProperties(false)
          .description('Politician names.')
          .prop(
            'results',
            S.array().items(
              S.object()
                .additionalProperties(false)
                .prop('id', S.string().format('uuid'))
                .description('Politician id.')
                .required()
                .prop('firstName', S.string().minLength(1).maxLength(50))
                .description('Politician first name.')
                .required()
                .prop('lastName', S.string().minLength(1).maxLength(50))
                .description('Politician first name.')
                .required()
            )
          )
          .required(),
      },
    },
    handler: onListPoliticianNames,
  })

  async function onListPoliticianNames() {
    const names = await massive.politician.find(
      {},
      {
        order: [
          {
            field: 'firstName',
            direction: 'asc',
          },
        ],
        fields: ['id', 'firstName', 'lastName'],
      }
    )

    return {
      results: names,
    }
  }
}
