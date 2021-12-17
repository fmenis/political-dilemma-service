import { sCreatePermission, sPermissionResponse } from './lib/schema.js'

export default async function createPermission(fastify, options) {
  const { db, httpErrors } = fastify
  const { createError } = httpErrors

  fastify.route({
    method: 'POST',
    path: '',
    config: {
      public: false,
    },
    schema: {
      summary: 'Create permission',
      description: 'Create permission.',
      body: sCreatePermission(),
      response: {
        201: sPermissionResponse(),
      },
    },
    preHandler: async function (req, reply) {
      const { resource, action, ownership } = req.body
      const query =
        'SELECT id FROM permissions WHERE resource=$1 AND action=$2 AND ownership=$3'
      const match = await db.execQuery(query, [resource, action, ownership], {
        findOne: true,
      })
      if (match) {
        throw createError(400, 'Bad Request', {
          validation: [{ message: 'Permission already exists' }],
        })
      }
    },
    handler: onCreatePermission,
  })

  async function onCreatePermission(req, reply) {
    const { resource, action, ownership, description } = req.body

    const query =
      'INSERT INTO permissions ' +
      '(resource, action, ownership, description) ' +
      'VALUES ($1, $2, $3, $4) ' +
      'RETURNING id, resource, action, ownership, description'

    const inputs = [resource, action, ownership, description]
    const permission = await db.execQuery(query, inputs, { findOne: true })
    return permission
  }
}
