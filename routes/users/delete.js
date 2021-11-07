import S from 'fluent-json-schema'

export default async function deleteUser(fastify, opts) {
  fastify.route({
    method: 'DELETE',
    path: '/:id',
    config: {
      public: false
    },
    schema: {
      tags: ['users'],
      summary: 'Delete user',
      description: 'Delete user by id.',
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.integer().minimum(1))
        .description('User id')
        .required(),
      response: {
        204: fastify.getSchema('sNoContent'),
        404: fastify.getSchema('sNotFound'),
        409: fastify.getSchema('sConflict'),
      }
    },
    handler: onDeleteUser
  })

  async function onDeleteUser(req, reply) {
    const { db, httpErrors } = this
    const { id } = req.params
    const { user } = req

    const { id: user_id } = await db.findOne('SELECT id FROM users WHERE id=$1', [id])
    if (!user_id) {
      throw httpErrors.notFound(`User with id '${id}' not found`)
    }

    if (user_id ===  user.id) {
      throw httpErrors.conflict(`Cannot delete your own user`)
    }

    await db.execQuery(query, [id])
    reply.code(204)
  }
}