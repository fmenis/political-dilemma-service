import { sUserResponse } from './lib/schema.js'

export default async function userWhoami(fastify) {
  fastify.route({
    method: 'GET',
    path: '/whoami',
    config: {
      public: false,
      permission: 'user:whoami',
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

    user.permissions = user.permissions.map(item => {
      const splitted = item.split(':')
      return `${splitted[0]}:${splitted[1]}`
    })

    return user
  }
}
