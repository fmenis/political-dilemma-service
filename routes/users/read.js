import S from 'fluent-json-schema'
import { sUserResponse } from './lib/schema.js'

export default async function readUser(fastify, opts) {
  fastify.route({
    method: 'GET',
    path: '/:id',
    schema: {
      tags: ['users'],
			summary: 'Get user',
      description: 'Get user by id.',
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.integer().minimum(1))
        .description('User id')
        .required(),
      response: {
        200: sUserResponse()
      }
    },
    handler: onReadUser
  })

  async function onReadUser(req, reply) {
    const { pg, httpErrors, log } = this
    const { id } = params

    const user = await pg.users.findOne(id)
    if (!user) {
      log.vebose(`User '${id}' not found`)
      throw httpErrors.notFound(`User '${id}' not found`)
    }

    return user
  }
}