import S from 'fluent-json-schema'

import { sPoliticianList } from './lib/schema.js'
import {
  buildRouteFullDescription,
  buildPaginatedInfo,
} from '../common/common.js'
import { getPoliticianTypes } from './lib/common.js'
import { appConfig } from '../../config/main.js'

export default async function listPoliticians(fastify) {
  const { massive, politicianErrors } = fastify
  const { errors } = politicianErrors

  const api = 'list'
  const permission = `politician:${api}`
  const { defaultLimit, defaultOffset } = appConfig.pagination

  fastify.route({
    method: 'GET',
    path: '/',
    config: {
      public: false,
      permission,
    },
    schema: {
      summary: 'List politicians',
      description: buildRouteFullDescription({
        description: 'List politicians',
        errors,
        permission,
        api,
      }),
      query: S.object()
        .additionalProperties(false)
        .prop('type', S.string().enum(getPoliticianTypes()))
        .description('Filter by politician type')
        .prop('limit', S.integer())
        .description('Number of results (pagination).')
        .default(defaultLimit)
        .prop('offset', S.integer())
        .description('Items to skip (pagination).')
        .default(defaultOffset),
      response: {
        200: S.object()
          .additionalProperties(false)
          .description('Politicians.')
          .prop('results', S.array().maxItems(200).items(sPoliticianList()))
          .required()
          .prop('paginatedInfo', fastify.getSchema('sPaginatedInfo'))
          .required(),
      },
    },
    handler: onListPolitician,
  })

  async function onListPolitician(req) {
    const { query } = req

    const filters = buildFilters(query)
    const options = buildOptions(query)

    const [politicians, count] = await Promise.all([
      massive.politician.find(filters, options),
      massive.politician.count(),
    ])

    return {
      results: politicians,
      paginatedInfo: buildPaginatedInfo(count, {
        limit: query.limit,
        offset: query.offset,
      }),
    }
  }

  function buildOptions(query) {
    const options = {
      order: [
        {
          field: 'firstName',
          direction: 'asc',
        },
      ],
      limit: query.limit,
      offset: query.offset,
    }

    return options
  }

  function buildFilters(query) {
    const filters = {}

    if (query.type) {
      filters.type = query.type
    }

    return filters
  }
}
