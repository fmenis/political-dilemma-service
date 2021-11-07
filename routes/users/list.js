import S from 'fluent-json-schema'

import { sUserResponse } from './lib/schema.js'

export default async function listUsers(fastify, opts) {
  fastify.route({
    method: 'POST',
    path: '/list',
    schema: {
      tags: ['users'],
      summary: 'User list',
      description: 'Get all users.',
      querystring: S.object()
        .additionalProperties(false)
        .prop('is_blocked', S.boolean())
        .description('Returns blocked or non blocked users. Default all'),
      response: {
        200: S.object()
          .additionalProperties(false)
          .prop('results', S.array().items(sUserResponse()))
      }
    },
    handler: onListUsers
  })

  async function onListUsers(req, reply) {
    const { db } = this
    const { query } = req

    const options = {
      filters: {
        is_blocked: query.is_blocked
      },
      pagination: {
        limit: query.limit ?? 10,
        offset: query.offset ?? 0
      }
    }

    const users = await execQuery(options, db)
    return { results: users }
  }

  async function execQuery(options, db) {
    const base_query = 'SELECT id, first_name, last_name, user_name, email, bio, is_blocked, created_at, updated_at FROM users'
    const db_obj = applyFilters(base_query, options.filters)
    const { query, inputs } = applyPagination(db_obj.query, options.pagination, db_obj.inputs)

    const res = await db.execQuery(query, inputs)
    return res.rows
  }

  function applyFilters(query, filters, inputs = []) {
    const where = Object.entries(filters).reduce((acc, item) => {
      const [ field, value ] = item

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