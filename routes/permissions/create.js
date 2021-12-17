import { sCreatePermission, sPermissionResponse } from './lib/schema.js'

export default async function createPermission(fastify, options) {
  const { db } = fastify

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
