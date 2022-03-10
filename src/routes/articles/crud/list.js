import S from 'fluent-json-schema'

import { sArticleList } from '../lib/schema.js'
import { buildPaginatedInfo } from '../../lib/common.js'
// import { STATUS } from '../lib/enums.js'
import { getStates } from '../lib/common.js'

export default async function listArticles(fastify) {
  const { massive } = fastify

  fastify.route({
    method: 'GET',
    path: '/',
    config: {
      public: false,
      permission: 'article:list',
    },
    schema: {
      summary: 'List articles',
      description: 'Get all articles.',
      querystring: S.object()
        .additionalProperties(false)
        .prop('status', S.string().enum(getStates()))
        .description('Filter by status.')
        .prop('category', S.string().minLength(3))
        .description('Filter by category.')
        .prop(
          'sortBy',
          S.string().enum([
            'title',
            'category',
            'status',
            'publishedAt',
            'createdAt',
          ])
        )
        .description('Field used to sort results (sorting).')
        .default('createdAt')
        .prop('order', S.string().enum(['ASC', 'DESC']))
        .description('Sort order (sorting).')
        .default('ASC')
        .prop('limit', S.number())
        .description('Number of results (pagination).')
        .default(10)
        .prop('offset', S.number())
        .description('Items to skip (pagination).')
        .default(0),
      response: {
        200: S.object()
          .additionalProperties(false)
          .description('Articles.')
          .prop('results', S.array().items(sArticleList()))
          .required()
          .prop('paginatedInfo', fastify.getSchema('sPaginatedInfo'))
          .required(),
      },
    },
    handler: onListArticles,
  })

  async function onListArticles(req, reply) {
    const { query } = req
    const { limit, offset } = query

    const criteria = buildCriteria(query)

    const [articles, count] = await Promise.all([
      massive.articles.find(criteria, buildOptions(query)),
      massive.articles.count(criteria),
    ])

    reply.send({
      results: articles,
      paginatedInfo: buildPaginatedInfo(parseInt(count), { limit, offset }),
    })
  }

  function buildCriteria(query) {
    const filters = {}

    if (query.status) {
      filters.status = query.status
    }

    if (query.category) {
      filters.category = query.category
    }

    return filters
  }

  function buildOptions(query) {
    const { limit, offset, sortBy, order } = query

    const options = {
      fields: ['id', 'title', 'category', 'status', 'publishedAt'],
      limit,
      offset,
      order: [
        {
          field: sortBy,
          direction: order,
        },
      ],
    }

    return options
  }
}
