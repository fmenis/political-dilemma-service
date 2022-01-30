import S from 'fluent-json-schema'

export default async function checkLink(fastify) {
  fastify.route({
    method: 'GET',
    path: '/reset-password/:token',
    config: {
      public: true,
    },
    schema: {
      summary: 'Reset link check', //TODO
      description: 'Check the rest link and related info.', //TODO
      params: S.object()
        .additionalProperties(false)
        .prop('token', S.string().minLength(60).maxLength(60))
        .description('Reset password token.')
        .required(),
      response: {
        204: fastify.getSchema('sNoContent'),
      },
    },
    handler: onCheckLink,
  })

  async function onCheckLink(req, reply) {
    return reply.render('/reset-password-form.html', {
      firstName: 'Phil',
    })
  }
}
