import sendResetPasswordLink from './sendLink.js'
import renderForm from './renderForm.js'
import resetPassword from './resetPassword.js'

export default async function index(fastify) {
  fastify.addHook('onRoute', options => {
    options.schema = {
      ...options.schema,
      tags: ['reset password'],
    }
  })

  const prefix = '/v1'

  fastify.register(sendResetPasswordLink, { prefix })
  fastify.register(renderForm, { prefix })
  fastify.register(resetPassword, { prefix })
}
