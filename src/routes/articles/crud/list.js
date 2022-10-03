import S from 'fluent-json-schema'

import { sArticleList } from '../lib/schema.js'
import { appConfig } from '../../../config/main.js'
import { getArticleStates } from '../lib/common.js'
import { buildPaginatedInfo } from '../../lib/common.js'

export default async function listArticles(fastify) {
  const { massive } = fastify
  const permission = 'article:list'
  const { defaultLimit, defaultOffset } = appConfig.pagination

  fastify.route({
    method: 'GET',
    path: '/',
    config: {
      public: false,
      permission,
    },
    schema: {
      summary: 'List articles',
      description: `Permission required: ${permission}`,
      query: S.object()
        .additionalProperties(false)
        .prop('status', S.string().enum(getArticleStates()))
        .description('Filter by article states')
        .prop('search', S.string().minLength(1))
        .description('Full text search.')
        .prop('sortBy', S.string().enum(['title']))
        .description('Field used to sort results (sorting).')
        .prop('order', S.string().enum(['ASC', 'DESC']))
        .prop('limit', S.number())
        .description('Number of results (pagination).')
        .default(defaultLimit)
        .prop('offset', S.number())
        .description('Items to skip (pagination).')
        .default(defaultOffset),
      response: {
        200: S.object()
          .additionalProperties(false)
          .description('Articles.')
          .prop('results', S.array().maxItems(200).items(sArticleList()))
          .required()
          .prop('paginatedInfo', fastify.getSchema('sPaginatedInfo'))
          .required(),
      },
    },
    handler: onListArticles,
  })

  async function onListArticles(req) {
    const { query } = req

    const criteria = buildCriteria(query)
    const options = buildOptions(query)

    //TODO migliorare con un join

    const [articles, count] = await Promise.all([
      massive.articles.find(criteria, options),
      massive.articles.count(criteria),
    ])

    return {
      results: await populateArticles(articles),
      paginatedInfo: buildPaginatedInfo(count, {
        limit: query.limit,
        offset: query.offset,
      }),
    }
  }

  function buildCriteria(query) {
    const criteria = {}

    if (query.search) {
      criteria.and = [
        {
          'title ILIKE': `%${query.search}%`,
        },
      ]
    }

    if (query.status) {
      criteria.status = query.status
    }

    if (query.status) {
      criteria.status = query.status
    }

    //##TODO capire come si fanno le query sulle join (eg: categoria, autore)

    return criteria
  }

  function buildOptions(query) {
    const options = {
      order: [
        {
          field: 'updatedAt',
          direction: 'desc',
        },
      ],
      limit: query.limit,
      offset: query.offset,
    }

    if (query.sortBy && query.order) {
      options.order = [
        {
          field: query.sortBy,
          direction: query.order,
        },
      ]
    }

    return options
  }

  async function populateArticles(articles) {
    const [owners, internalNotes] = await Promise.all([
      massive.users.find(
        {
          id: articles.map(item => item.ownerId),
        },
        { fields: ['id', 'first_name', 'last_name'] }
      ),
      massive.internalNotes.find({
        relatedDocumentId: articles.map(item => item.id),
      }),
    ])

    return articles.map(article => {
      const author = owners.find(item => item.id === article.ownerId)
      return {
        ...article,
        author: `${author.first_name} ${author.last_name}`,
        hasNotifications: internalNotes.some(
          item => item.relatedDocumentId === article.id
        ),
      }
    })
  }
}
