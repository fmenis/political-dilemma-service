import _ from 'lodash'

import { sCreateRole } from './lib/schema.js'

export default async function createRole(fastify, options) {
  const { db, httpErrors } = fastify
  const { createError } = httpErrors

  fastify.route({
    method: 'POST',
    path: '',
    config: {
      public: false,
    },
    schema: {
      summary: 'Create role',
      description: 'Create role.',
      body: sCreateRole(),
      // response: {
      //   201: sRoleResponse(),
      // },
    },
    preHandler: onPreHandler,
    handler: onCreateRole,
  })

  async function onPreHandler(req, reply) {
    const { permissionsIds } = req.body

    const { rows } = await db.execQuery(
      'SELECT id FROM permissions WHERE id = ANY ($1)',
      permissionsIds
    )

    //TODO testare
    if (rows.length !== permissionsIds.length) {
      const missingPermissionsIds = _.difference(rows, permissionsIds)

      throw createError(400, 'Invalid input', {
        validation: [
          {
            message: `Missing permissions: ${missingPermissionsIds.join(', ')}`,
          },
        ],
      })
    }
  }

  async function onCreateRole(req, reply) {
    const { name, description, permissionsIds } = req.body

    let client

    try {
      client = await db.beginTransaction()

      const query =
        'INSERT INTO roles ' +
        '(name, description) ' +
        'VALUES ($1, $2) ' +
        'RETURNING id, name, description'

      const role = await db.execQuery(query, [name, description], {
        findOne: true,
      })

      await db.commitTransaction(client)
      return role
    } catch (error) {
      await db.rollbackTransaction(client)
      throw error
    }
  }
}
