import S from 'fluent-json-schema'
import path from 'path'

import { readFile } from 'fs'
import { promisify } from 'util'
const readFileAsync = promisify(readFile)

import { sUserList } from '../lib/schema.js'

export default async function listUsers(fastify) {
  const { pg } = fastify
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
      querystring: S.object()
        .additionalProperties(false)
        .prop('type', S.string().enum(['backoffice', 'site']))
        .description('Filter by user type.')
        .prop('firstName', S.string().minLength(3))
        .description('Filter by user first name.')
        .prop('lastName', S.string().minLength(3))
        .description('Filter by user last name.')
        .prop('userName', S.string().minLength(3))
        .description('Filter by user name.')
        .prop('email', S.string().minLength(3))
        .description('Filter by user email.')
        .prop('isBlocked', S.boolean())
        .description('Returns blocked or not blocked users.')
        .prop('isDeleted', S.boolean())
        .description('Returns deleted or not deleted users.')
        .prop('role', S.string().minLength(2))
        .description('Filter by user role.')
        .prop('search', S.string().minLength(3))
        .description('Full text search field.'),
      response: {
        200: S.object()
          .additionalProperties(false)
          .prop('items', S.array().items(sUserList()))
          .required()
          .prop('totItems', S.integer())
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
        first_name: {
          value: query.firstName,
          mode: 'contains',
        },
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
      },
      pagination: {
        limit: query.limit ?? 10,
        offset: query.offset ?? 0,
      },
    }

    const { users, count } = await execQuery(options, pg)

    return {
      items: users,
      totItems: count,
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

  async function execQuery(options, pg) {
    const baseQuery = await getAndCacheBaseQuery()

    let dbObj = applyFilters(baseQuery, options.filters)

    dbObj = applyFullTextSearch(dbObj.query, options.fullText, dbObj.inputs)

    const count = await getRowCount(dbObj)

    const { query, inputs } = applyPagination(
      dbObj.query,
      options.pagination,
      dbObj.inputs
    )

    const { rows } = await pg.execQuery(query.replace(/{columns}/g, ''), inputs)

    const users = await populateUserList(rows)

    return {
      users,
      count,
    }
  }

  async function getRowCount(dbObj) {
    const splitted = dbObj.query.split('{columns}')
    let query = [splitted[0]]
    query.push('COUNT(users.id) AS count')
    query.push(splitted[2])

    query = query.join(' ')

    const { rows } = await pg.execQuery(query, dbObj.inputs)
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
      query = `${query} WHERE ${where.join(' AND ')}`
    }

    return { query, inputs }
  }

  function applyFullTextSearch(query, fullText, inputs = []) {
    if (!fullText.value) {
      return { query, inputs }
    }

    inputs.push(`%${fullText.value}%`)

    const searchabeFields = ['first_name', 'last_name', 'user_name', 'email']

    const searchWhereStatement = searchabeFields.reduce((acc, field) => {
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

  function applyPagination(query, pagination, inputs) {
    query += ` LIMIT $${inputs.length + 1} OFFSET $${inputs.length + 2}`
    inputs.push(pagination.limit, pagination.offset)
    return { query, inputs }
  }

  async function populateUserList(users) {
    // TODO mock data
    return users.map(user => {
      return {
        ...user,
        publishedLaws: 0,
        draftLaws: 0,
        publishedArticles: 0,
        draftArticles: 0,
      }
    })
  }
}
