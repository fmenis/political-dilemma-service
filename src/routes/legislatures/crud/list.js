import S from 'fluent-json-schema'

import { sLegislatureList } from '../lib/schema.js'
import {
  buildRouteFullDescription,
  buildPaginatedInfo,
} from '../../common/common.js'
import { appConfig } from '../../../config/main.js'

export default async function listLegislatures(fastify) {
  const { massive } = fastify

  const routeDescription = 'List legislatures.'
  const api = 'list'
  const permission = `legislature:${api}`
  const { defaultLimit, defaultOffset } = appConfig.pagination

  fastify.route({
    method: 'GET',
    path: '/',
    config: {
      public: false,
      permission,
    },
    schema: {
      summary: routeDescription,
      description: buildRouteFullDescription({
        description: routeDescription,
        permission,
        api,
      }),
      query: S.object()
        .additionalProperties(false)
        .prop('search', S.string().minLength(1).maxLength(30))
        .description('Full text search (by name).')
        .prop('limit', S.integer())
        .description('Number of results (pagination).')
        .default(defaultLimit)
        .prop('offset', S.integer())
        .description('Items to skip (pagination).')
        .default(defaultOffset),
      response: {
        200: S.object()
          .additionalProperties(false)
          .description('Legislatures.')
          .prop('results', S.array().maxItems(200).items(sLegislatureList()))
          .required()
          .prop('paginatedInfo', fastify.getSchema('sPaginatedInfo'))
          .required(),
      },
    },
    handler: onCreateLegislature,
  })

  async function onCreateLegislature(req, reply) {
    const { query } = req

    const filters = buildFilters(query)
    const options = buildOptions(query)

    const [legislatures, count] = await Promise.all([
      massive.legislature.find(filters, options),
      massive.legislature.count(filters),
    ])

    reply.send({
      results: legislatures,
      paginatedInfo: buildPaginatedInfo(count, {
        limit: query.limit,
        offset: query.offset,
      }),
    })
  }

  function buildOptions(query) {
    const options = {
      order: [
        {
          field: 'createdAt',
          direction: 'desc',
        },
      ],
      limit: query.limit,
      offset: query.offset,
    }

    return options
  }

  function buildFilters(query) {
    const filters = {}

    if (query.search) {
      filters['name ILIKE'] = `%${query.search}%`
    }

    return filters
  }
}
