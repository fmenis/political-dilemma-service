import S from 'fluent-json-schema'
import path from 'path'

import { readFile } from 'fs'
import { promisify } from 'util'
const readFileAsync = promisify(readFile)

import { sUserList } from '../lib/schema.js'
import { buildPaginatedInfo } from '../../common/common.js'
import { appConfig } from '../../../config/main.js'

export default async function listUsers(fastify) {
  const { pg } = fastify
  const { defaultLimit, defaultOffset } = appConfig.pagination

  let userListQuery

  fastify.route({
    method: 'GET',
    path: '',
    config: {
      public: false,
      permission: 'user:list',
    },
    schema: {
      summary: 'List users',
      description: 'Get all users.',
      query: S.object()
        .additionalProperties(false)
        .prop('type', S.string().enum(['backoffice', 'site']))
        .description('Filter by user type.')
        .prop('firstName', S.string().minLength(1))
        .description('Filter by user first name.')
        .prop('lastName', S.string().minLength(1))
        .description('Filter by user last name.')
        .prop('userName', S.string().minLength(1))
        .description('Filter by user name.')
        .prop('email', S.string().minLength(1))
        .description('Filter by user email.')
        .prop('isBlocked', S.boolean())
        .description('Returns blocked or not blocked users.')
        .prop('isDeleted', S.boolean())
        .description('Returns deleted or not deleted users.')
        .prop('role', S.string().minLength(1))
        .description('Filter by user role.')
        .prop('search', S.string().minLength(1))
        .description('Full text search.')
        .prop(
          'sortBy',
          S.string().enum(['firstName', 'lastName', 'email', 'role'])
        )
        .description('Field used to sort results (sorting).')
        .prop('order', S.string().enum(['ASC', 'DESC']))
        .description('Sort order (sorting).')
        .prop('limit', S.integer())
        .default(defaultLimit)
        .description('Number of results (pagination).')
        .prop('offset', S.integer())
        .default(defaultOffset)
        .description('Items to skip (pagination).'),
      response: {
        200: S.object()
          .additionalProperties(false)
          .prop('results', S.array().maxItems(200).items(sUserList()))
          .required()
          .prop('paginatedInfo', fastify.getSchema('sPaginatedInfo'))
          .required(),
      },
    },
    handler: onListUsers,
  })

  async function onListUsers(req) {
    const { query } = req

    const options = {
      filters: {
        type: { value: query.type, mode: 'equal' },
        first_name: { value: query.firstName, mode: 'contains' },
        last_name: { value: query.lastName, mode: 'contains' },
        user_name: { value: query.userName, mode: 'contains' },
        email: { value: query.email, mode: 'contains' },
        is_blocked: { value: query.isBlocked, mode: 'equal' },
        is_deleted: { value: query.isDeleted, mode: 'equal' },
        role: {
          value: query.role,
          mode: 'contains',
          dbField: 'name',
          table: 'roles',
        },
      },
      fullText: {
        value: query.search,
        fields: ['first_name', 'last_name', 'user_name', 'email'],
      },
      sortings: {
        field: query.sortBy || 'created_at',
        order: query.order || 'ASC',
      },
      pagination: {
        limit: query.limit,
        offset: query.offset,
      },
    }

    const { users, count } = await getUsersList(options, pg)

    return {
      results: users,
      paginatedInfo: buildPaginatedInfo(count, options.pagination),
    }
  }

  //-------------------------------------- HELPERS ----------------------------

  async function getUsersList(options, pg) {
    const baseQuery = await getAndCacheBaseQuery()

    let dbObj = applyFilters(baseQuery, options.filters)

    dbObj = applyFullTextSearch(dbObj.query, options.fullText, dbObj.inputs)

    const count = await getRowCount(dbObj.query, dbObj.inputs)

    dbObj = applySortings(dbObj.query, options.sortings, dbObj.inputs)

    dbObj = applyPagination(dbObj.query, options.pagination, dbObj.inputs)

    const { rows: users } = await pg.execQuery(
      dbObj.query.replace(/{columns}/g, ''),
      dbObj.inputs
    )

    return {
      users: await populateUsers(users, pg),
      count,
    }
  }

  async function getAndCacheBaseQuery() {
    if (!userListQuery) {
      const relativePath = 'src/routes/users/crud/sql/list.sql'
      const sqlFilePath = path.join(path.resolve(), relativePath)
      userListQuery = await readFileAsync(sqlFilePath, 'utf8')
    }

    return userListQuery
  }

  async function getRowCount(query, inputs) {
    const splitted = query.split('{columns}')
    query = [splitted[0]]
    query.push('COUNT(users.id) AS count')
    query.push(splitted[2])

    query = query.join(' ')

    const { rows } = await pg.execQuery(query, inputs)
    return parseInt(rows[0].count)
  }

  function applyFilters(query, filters, inputs = []) {
    const where = Object.keys(filters).reduce((acc, field) => {
      const { value, mode, table, dbField } = filters[field]

      if (value === undefined) {
        return acc
      }

      if (mode === 'equal') {
        inputs.push(value)
        acc.push(`${table || 'users'}.${dbField || field} = $${inputs.length}`)
      }

      if (mode === 'contains') {
        inputs.push(`%${value}%`)
        acc.push(
          `${table || 'users'}.${dbField || field} ILIKE $${inputs.length}`
        )
      }

      return acc
    }, [])

    if (where.length) {
      const operator =
        filters.is_blocked.value === true && filters.is_deleted.value === true
          ? 'OR'
          : 'AND'
      query = `${query} WHERE ${where.join(` ${operator} `)}`
    }

    return { query, inputs }
  }

  function applyFullTextSearch(query, fullText, inputs = []) {
    if (!fullText.value) {
      return { query, inputs }
    }

    inputs.push(`%${fullText.value}%`)

    const searchWhereStatement = fullText.fields.reduce((acc, field) => {
      acc.push(`${field} ILIKE $${inputs.length}`)
      return acc
    }, [])

    if (query.includes('WHERE')) {
      query = `${query} AND (${searchWhereStatement.join(' OR ')})`
    } else {
      query = `${query} WHERE ${searchWhereStatement.join(' OR ')}`
    }

    return { query, inputs }
  }

  function applySortings(query, sortings, inputs) {
    // convert to snake case
    let field = sortings.field.replace(
      /[A-Z]/g,
      letter => `_${letter.toLowerCase()}`
    )

    if (field === 'role') {
      field = `roles.name`
    } else {
      field = `users.${field}`
    }

    // cannot lower a timestamp!
    if (field !== 'users.last_access' && field !== 'users.created_at') {
      field = `lower(${field})`
    }

    query += ` ORDER BY ${field} ${sortings.order}`
    return { query, inputs }
  }

  function applyPagination(query, pagination, inputs) {
    query += ` LIMIT $${inputs.length + 1} OFFSET $${inputs.length + 2}`
    inputs.push(pagination.limit, pagination.offset)
    return { query, inputs }
  }

  async function populateUsers(users, pg) {
    const [
      draftedActivities,
      publishedActivities,
      draftedArticles,
      publishedArticles,
    ] = await Promise.all([
      countDraftedActivities(pg),
      countPublishedActivities(pg),
      countDraftedArticles(pg),
      countPublishedArticles(pg),
    ])

    return users.map(user => {
      const countPublishedActivities = publishedActivities.find(
        item => item.id === user.id
      )
        ? parseInt(publishedActivities.find(item => item.id === user.id).count)
        : 0

      const countDraftedActivities = draftedActivities.find(
        item => item.id === user.id
      )
        ? parseInt(draftedActivities.find(item => item.id === user.id).count)
        : 0

      const countDraftedArticles = draftedArticles.find(
        item => item.id === user.id
      )
        ? parseInt(draftedArticles.find(item => item.id === user.id).count)
        : 0

      const countPublishedArticles = publishedArticles.find(
        item => item.id === user.id
      )
        ? parseInt(publishedArticles.find(item => item.id === user.id).count)
        : 0

      return {
        ...user,
        draftArticles: countDraftedArticles,
        publishedArticles: countPublishedArticles,
        draftActivities: countDraftedActivities,
        publishedActivities: countPublishedActivities,
      }
    })
  }

  async function countPublishedActivities(pg) {
    const query = `
      SELECT us.id, count(ac.id)
      FROM users as us
      JOIN activity as ac
      ON us.id = ac."ownerId"
      WHERE ac.status = 'PUBLISHED' OR ac.status = 'ARCHIVED'
      GROUP BY us.id`

    const { rows } = await pg.execQuery(query)
    return rows
  }

  async function countDraftedActivities(pg) {
    const query = `
      SELECT us.id, count(ac.id)
      FROM users as us
      JOIN activity as ac
      ON us.id = ac."ownerId"
      WHERE ac.status <> 'PUBLISHED' AND ac.status <> 'ARCHIVED' AND status <> 'READY'
      GROUP BY us.id`

    const { rows } = await pg.execQuery(query)
    return rows
  }

  async function countDraftedArticles(pg) {
    const query = `
      SELECT us.id, count(ac.id)
      FROM users as us
      JOIN articles as ac
      ON us.id = ac."ownerId"
      WHERE ac.status <> 'PUBLISHED' AND ac.status <> 'ARCHIVED' AND status <> 'READY'
      GROUP BY us.id`

    const { rows } = await pg.execQuery(query)
    return rows
  }

  async function countPublishedArticles(pg) {
    const query = `
      SELECT us.id, count(ac.id)
      FROM users as us
      JOIN articles as ac
      ON us.id = ac."ownerId"
      WHERE ac.status = 'PUBLISHED' OR ac.status = 'ARCHIVED'
      GROUP BY us.id`

    const { rows } = await pg.execQuery(query)
    return rows
  }
}
