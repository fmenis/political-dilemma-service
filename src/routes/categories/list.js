import S from 'fluent-json-schema'

import { getCategoryTypes } from './lib/common.js'
import { buildRouteFullDescription } from '../common/common.js'

export default async function listCategories(fastify) {
  const { massive } = fastify
  const description = 'Retrieve categories.'

  fastify.route({
    method: 'GET',
    path: '/',
    config: {
      public: false,
    },
    schema: {
      summary: 'List categories',
      description: buildRouteFullDescription({
        description,
      }),
      query: S.object()
        .additionalProperties(false)
        .prop('type', S.string().enum(getCategoryTypes()))
        .description('Filter by category types'),
      response: {
        200: S.object()
          .additionalProperties(false)
          .prop(
            'results',
            S.array()
              .maxItems(200)
              .items(
                S.object()
                  .additionalProperties(false)
                  .description('Categories.')
                  .prop('id', S.string().format('uuid'))
                  .description('Category id.')
                  .required()
                  .prop('name', S.string())
                  .description('Category name.')
                  .required()
                  .prop('type', S.string().enum(getCategoryTypes()))
                  .description('Category type.')
                  .required()
                  .prop('description', S.string())
                  .description('Category description.')
                  .required()
              )
          ),
      },
    },
    handler: onListCategories,
  })

  async function onListCategories(req) {
    const { type } = req.query

    const filter = type ? { type } : {}

    const categories = await massive.categories.find(filter, {
      order: [
        {
          field: 'name',
          direction: 'asc',
        },
      ],
    })

    return { results: categories }
  }
}
