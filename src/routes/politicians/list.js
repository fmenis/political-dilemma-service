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
        .prop('search', S.string().minLength(1).maxLength(30))
        .description('Full text search (by firstName and lastName).')
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
    handler: onListPoliticians,
  })

  async function onListPoliticians(req) {
    const { query } = req

    const filters = buildFilters(query)
    const options = buildOptions(query)

    const [politicians, count] = await Promise.all([
      massive.politician.find(filters, options),
      massive.politician.count(filters),
    ])

    return {
      results: await formatOutput(politicians),
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
        {
          field: 'id',
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

    if (query.search) {
      filters.or = [
        { 'firstName ILIKE': `%${query.search}%` },
        { 'lastName ILIKE': `%${query.search}%` },
      ]
    }

    return filters
  }

  async function formatOutput(politicians) {
    const groupIds = politicians.reduce((acc, item) => {
      if (item.groupId) {
        acc.add(item.groupId)
      }
      return acc
    }, new Set())

    const groups = await massive.group.find({ id: [...groupIds] })

    return politicians.map(politician => {
      const group = groups.find(group => group.id === politician.groupId)

      return {
        id: politician.id,
        type: politician.type,
        firstName: politician.firstName,
        lastName: politician.lastName,
        birthCity: politician.birthCity,
        birthDate: politician.birthDate,
        img: politician.img,
        groupName: group ? group.name : null,
        rating: 0, //##TODO implement
      }
    })
  }
}
