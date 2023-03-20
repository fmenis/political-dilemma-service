import S from 'fluent-json-schema'

import { buildRouteFullDescription } from '../../../common/common.js'

export default async function listArticleCategories(fastify) {
  const { massive } = fastify
  const { errors } = fastify.articleErrors

  fastify.route({
    method: 'GET',
    path: '/',
    config: {
      public: false,
    },
    schema: {
      summary: 'List article categories',
      description: buildRouteFullDescription({
        description: 'List articles categories.',
        errors,
        permission: null,
        api: 'list-categories',
      }),
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
                  .description('Article categories.')
                  .prop('id', S.string().format('uuid'))
                  .description('Category id.')
                  .required()
                  .prop('name', S.string())
                  .description('Category name.')
                  .required()
                  .prop('description', S.string())
                  .description('Category description.')
                  .required()
              )
          ),
      },
    },
    handler: onListArticleCategories,
  })

  async function onListArticleCategories() {
    const categories = await massive.categories.find(
      { type: 'ARTICLE' },
      {
        order: [
          {
            field: 'name',
            direction: 'asc',
          },
        ],
      }
    )

    return { results: categories }
  }
}
