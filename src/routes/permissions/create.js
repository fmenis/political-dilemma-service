import { sCreatePermission, sPermissionResponse } from './lib/schema.js'

export default async function createPermission(fastify) {
  const { pg, httpErrors } = fastify
  const { createError } = httpErrors

  //------------------------------------------------------------------
  //############ API NOT USED (AND EXPOSED) AT THE MOMENT ############
  //------------------------------------------------------------------

  fastify.route({
    method: 'POST',
    path: '',
    config: {
      public: false,
    },
    schema: {
      hide: true,
      summary: 'Create permission',
      description: 'Create permission.',
      body: sCreatePermission(),
      response: {
        201: sPermissionResponse(),
      },
    },
    preHandler: onPreHandler,
    handler: onCreatePermission,
  })

  async function onPreHandler(req) {
    const { resource, action, ownership } = req.body

    let query = 'SELECT id FROM permissions WHERE resource=$1 AND action=$2'
    query = ownership ? `${query} AND ownership=$3` : query

    const inputs = ownership
      ? [resource, action, ownership]
      : [resource, action]

    const match = await pg.execQuery(query, inputs, {
      findOne: true,
    })

    if (match) {
      throw createError(400, 'Bad Request', {
        validation: [{ message: 'Permission already exists' }],
      })
    }
  }

  async function onCreatePermission(req) {
    const { resource, action, ownership, description } = req.body

    const query =
      'INSERT INTO permissions ' +
      '(resource, action, ownership, description) ' +
      'VALUES ($1, $2, $3, $4) ' +
      'RETURNING id, resource, action, ownership, description'

    const inputs = [resource, action, ownership, description]
    const permission = await pg.execQuery(query, inputs, { findOne: true })
    return permission
  }
}
