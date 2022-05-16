import S from 'fluent-json-schema'

import { sPermissionResponse } from './lib/schema.js'

export default async function updatePermission(fastify) {
  const { pg, httpErrors } = fastify

  //------------------------------------------------------------------
  //############ API NOT USED (AND EXPOSED) AT THE MOMENT ############
  //------------------------------------------------------------------

  fastify.route({
    method: 'PUT',
    path: '/:id',
    config: {
      public: false,
    },
    schema: {
      hide: true,
      summary: 'Update permission',
      description: 'Update permission.',
      parmas: S.object()
        .additionalProperties(false)
        .prop('id', S.number().minimum(1))
        .description('Permission id.')
        .required(),
      body: S.object()
        .additionalProperties(false)
        .prop('description', S.string().maxLength(200))
        .description('Permission description.')
        .required(),
      response: {
        200: sPermissionResponse(),
        404: fastify.getSchema('sNotFound'),
        409: fastify.getSchema('sConflict'),
      },
    },
    preHandler: onPreHandler,
    handler: onUpdatePermission,
  })

  async function onPreHandler(req) {
    const { id } = req.params

    const permission = await pg.execQuery(
      'SELECT id FROM permissions WHERE id=$1',
      [id],
      {
        findOne: true,
      }
    )

    if (!permission) {
      throw httpErrors.notFound(`Permission with id '${id}' not found`)
    }
  }

  async function onUpdatePermission(req) {
    const { id } = req.params
    const { description } = req.body

    const query =
      'UPDATE permissions SET description=$2 WHERE id=$1' +
      'RETURNING id, resource, action, ownership, description'

    const { rowCount, rows } = await pg.execQuery(query, [id, description])
    if (!rowCount) {
      throw httpErrors.conflict('The action had no effect')
    }

    return rows[0]
  }
}
