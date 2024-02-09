import S from 'fluent-json-schema'

import { sUpdateGroup, sGroupDetail } from './lib/schema.js'
import { buildRouteFullDescription } from '../common/common.js'

export default async function updateGroup(fastify) {
  const { massive, groupErrors } = fastify
  const { throwNotFoundError, errors } = groupErrors

  const api = 'update'
  const permission = `group:${api}`

  fastify.route({
    method: 'PATCH',
    path: '/:id',
    config: {
      public: false,
      permission,
    },
    schema: {
      summary: 'Update group',
      description: buildRouteFullDescription({
        description: 'Update group',
        errors,
        permission,
        api,
      }),
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.string().format('uuid'))
        .description('Group id.')
        .required(),
      body: sUpdateGroup(),
      response: {
        200: sGroupDetail(),
        404: fastify.getSchema('sNotFound'),
      },
    },
    handler: onUpdateGroup,
  })

  async function onUpdateGroup(req) {
    const { id } = req.params
    const { body } = req

    const group = await massive.group.findOne(id)
    if (!group) {
      throwNotFoundError({ id, name: 'group' })
    }

    const updatedGroup = await massive.group.update(id, {
      ...body,
      updatedAt: new Date(),
    })

    return updatedGroup
  }
}
