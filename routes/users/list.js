import S from 'fluent-json-schema'

import { sUserList } from './lib/schema.js'

export default async function listUsers(fastify) {
  const { db } = fastify

  fastify.route({
    method: 'GET',
    path: '',
    config: {
      public: false,
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

    const users = await execQuery(options, db)
    return { results: users }
  }

  async function execQuery(options, db) {
    const baseQuery =
      'SELECT id, first_name, last_name, user_name, email, ' +
      'joined_date, is_blocked, is_deleted FROM users'

    const dbObj = applyFilters(baseQuery, options.filters)

    const { query, inputs } = applyPagination(
      dbObj.query,
      options.pagination,
      dbObj.inputs
    )

    const res = await db.execQuery(query, inputs)
    return res.rows
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
