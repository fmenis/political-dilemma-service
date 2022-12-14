import S from 'fluent-json-schema'

import { sArticleList } from '../lib/schema.js'
import { appConfig } from '../../../config/main.js'
import { getArticleStates } from '../lib/common.js'
import { buildPaginatedInfo, restrictDataToOwner } from '../../common/common.js'

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
        .prop('search', S.string().minLength(1).maxLength(30))
        .description('Full text search.')
        .prop('author', S.string().minLength(1).maxLength(30))
        .description('Filter by author (full name).')
        .prop('category', S.string().minLength(1).maxLength(30))
        .description('Filter by category.')
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
    const { query, user } = req

    const filters = buildFilters(query, user)
    const options = buildOptions(query)

    const [articles, count] = await Promise.all([
      massive.articles
        .join({
          categories: {
            on: { id: 'categoryId' },
          },
          users: {
            on: { id: 'ownerId' },
          },
        })
        .find(filters, options),
      massive.articles
        .join({
          categories: {
            on: { id: 'categoryId' },
          },
          users: {
            on: { id: 'ownerId' },
          },
        })
        .count(filters),
    ])

    return {
      results: await populateArticles(articles),
      paginatedInfo: buildPaginatedInfo(count, {
        limit: query.limit,
        offset: query.offset,
      }),
    }
  }

  function buildFilters(query, user) {
    const { id: userId, apiPermission } = user
    const filters = {}

    if (restrictDataToOwner(apiPermission)) {
      filters.ownerId = userId
    }

    if (query.search) {
      filters['title ILIKE'] = `%${query.search}%`
    }

    if (query.status) {
      filters.status = query.status
    }

    if (query.status) {
      filters.status = query.status
    }

    if (query.author) {
      filters.or = [
        { 'users.first_name ILIKE': `%${query.author}%` },
        { 'users.last_name ILIKE': `%${query.author}%` },
      ]
    }

    if (query.category) {
      filters['categories.name ILIKE'] = `%${query.category}%`
    }

    return filters
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
    const internalNotes = await massive.internalNotes.find({
      articleId: articles.map(item => item.id),
    })

    return articles.map(article => {
      const author = article.users[0]
      const categoryName = article.categories[0].name
      return {
        ...article,
        author: `${author.first_name} ${author.last_name}`,
        hasNotifications: internalNotes.some(
          item => item.articleId === article.id
        ),
        category: categoryName,
      }
    })
  }
}
