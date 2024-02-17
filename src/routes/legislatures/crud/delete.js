import S from 'fluent-json-schema'

import { buildRouteFullDescription } from '../../common/common.js'

export default async function deleteLegislature(fastify) {
  const { massive } = fastify
  const { throwNotFoundError, errors } = fastify.legislatureErrors

  const routeDescription = 'Delete legislature.'
  const api = 'delete'
  const permission = `legislature:${api}`

  fastify.route({
    method: 'DELETE',
    path: '/:id',
    config: {
      public: false,
      permission,
    },
    schema: {
      summary: routeDescription,
      description: buildRouteFullDescription({
        description: routeDescription,
        errors,
        permission,
        api,
      }),
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.string().format('uuid'))
        .description('Legislature id.')
        .required(),
      response: {
        204: fastify.getSchema('sNoContent'),
        404: fastify.getSchema('sNotFound'),
      },
    },
    preHandler: onPreHandler,
    handler: onDeleteLegislature,
  })

  async function onPreHandler(req) {
    const { id } = req.params

    if (!(await massive.legislature.findOne(id))) {
      throwNotFoundError({ id })
    }
  }

  async function onDeleteLegislature(req, reply) {
    const { id } = req.params

    await massive.withTransaction(async tx => {
      await tx.ministry.destroy({ legislatureId: id })
      await tx.legislature.destroy(id)
    })

    reply.code(204)
  }
}
