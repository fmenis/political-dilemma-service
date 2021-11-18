import { sUserResponse } from './lib/schema.js'

export default async function userMe(fastify) {
  fastify.route({
    method: 'GET',
    path: '/me',
    config: {
      public: false,
    },
    schema: {
      summary: 'Get authenticated user',
      description: 'Retrieve authenticated user info.',
      response: {
        200: sUserResponse(),
      },
    },
    handler: onUserMe,
  })

  async function onUserMe(req) {
    const { user } = req
    return user
  }
}
