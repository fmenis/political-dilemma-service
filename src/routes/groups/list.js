import S from 'fluent-json-schema'

import { sGroupDetail } from './lib/schema.js'
import {
  buildRouteFullDescription,
  buildPaginatedInfo,
} from '../common/common.js'
import { appConfig } from '../../config/main.js'

export default async function listGroups(fastify) {
  const { massive, groupErrors } = fastify
  const { errors } = groupErrors

  const api = 'list'
  const permission = `group:${api}`
  const { defaultLimit, defaultOffset } = appConfig.pagination

  fastify.route({
    method: 'GET',
    path: '/',
    config: {
      public: false,
      permission,
    },
    schema: {
      summary: 'List groups',
      description: buildRouteFullDescription({
        description: 'List groups',
        errors,
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
          .description('Groups.')
          .prop('results', S.array().maxItems(200).items(sGroupDetail()))
          .required()
          .prop('paginatedInfo', fastify.getSchema('sPaginatedInfo'))
          .required(),
      },
    },
    handler: onListGroups,
  })

  async function onListGroups(req) {
    const { query } = req

    const filters = buildFilters(query)
    const options = buildOptions(query)

    const [groups, count] = await Promise.all([
      massive.group.find(filters, options),
      massive.group.count(filters),
    ])

    return {
      results: groups,
      paginatedInfo: buildPaginatedInfo(count, {
        limit: query.limit,
        offset: query.offset,
      }),
    }
  }

  function buildFilters(query) {
    const filters = {}

    if (query.search) {
      filters['name ILIKE'] = `%${query.search}%`
    }

    return filters
  }

  function buildOptions(query) {
    const options = {
      fields: ['id', 'name', 'initials', 'colorCode', 'orientation'],
      order: [
        {
          field: 'name',
          direction: 'asc',
        },
      ],
      limit: query.limit,
      offset: query.offset,
    }

    return options
  }
}
