import S from 'fluent-json-schema'

export default async function renderForm(fastify) {
  fastify.route({
    method: 'GET',
    path: '/reset-password/:token',
    config: {
      public: true,
    },
    schema: {
      summary: 'Render reset password form',
      description: 'Render reset password form.',
      params: S.object()
        .additionalProperties(false)
        .prop('token', S.string().minLength(60).maxLength(60))
        .description('Reset password token.')
        .required(),
      response: {
        204: fastify.getSchema('sNoContent'),
      },
    },
    handler: onRenderForm,
  })

  async function onRenderForm(req, reply) {
    return reply.render('/reset-password-form.html')
  }
}
