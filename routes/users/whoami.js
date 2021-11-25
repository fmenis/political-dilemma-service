import { sUserResponse } from './lib/schema.js'

export default async function userWhoami(fastify) {
  fastify.route({
    method: 'GET',
    path: '/whoami',
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
    handler: onUserWhoami,
  })

  async function onUserWhoami(req) {
    const { user } = req
    return user
  }
}
