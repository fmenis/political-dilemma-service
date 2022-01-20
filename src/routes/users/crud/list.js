import S from 'fluent-json-schema'

import { sUserList } from '../lib/schema.js'
import { getUserRoles } from '../lib/utils.js'

export default async function listUsers(fastify) {
  const { pg } = fastify

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
        .prop('isBlocked', S.boolean())
        .description('Returns blocked or non blocked users.'),
      response: {
        200: S.object()
          .additionalProperties(false)
          .prop('results', S.array().items(sUserList())),
      },
    },
    handler: onListUsers,
  })

  async function onListUsers(req) {
    const { query } = req

    const options = {
      filters: {
        is_blocked: query.isBlocked,
      },
      pagination: {
        limit: query.limit ?? 10,
        offset: query.offset ?? 0,
      },
    }

    const users = await execQuery(options, pg)
    return { results: users }
  }

  async function execQuery(options, pg) {
    const baseQuery =
      'SELECT id, first_name, last_name, user_name, email, ' +
      'joined_date, is_blocked, is_deleted, last_access FROM users'

    const dbObj = applyFilters(baseQuery, options.filters)

    const { query, inputs } = applyPagination(
      dbObj.query,
      options.pagination,
      dbObj.inputs
    )

    const { rows } = await pg.execQuery(query, inputs)

    const roles = await getUserRoles(
      rows.map(item => item.id),
      pg
    )

    const userList = rows.map(user => {
      return {
        ...user,
        roles: roles
          .filter(item => item.userId === user.id)
          .map(item => item.name),
      }
    })

    return userList
  }

  function applyFilters(query, filters, inputs = []) {
    const where = Object.entries(filters).reduce((acc, item) => {
      const [field, value] = item

      if (value === undefined) {
        return acc
      }

      inputs.push(value)
      acc.push(`${field} = $${inputs.length}`)

      return acc
    }, [])

    if (where.length) {
      query = `${query} WHERE ${where.join(' AND ')}`
    }

    return { query, inputs }
  }

  function applyPagination(query, pagination, inputs) {
    query += ` LIMIT $${inputs.length + 1} OFFSET $${inputs.length + 2}`
    inputs.push(pagination.limit, pagination.offset)
    return { query, inputs }
  }
}
