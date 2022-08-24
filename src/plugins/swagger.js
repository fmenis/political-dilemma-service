import { readFileSync } from 'fs'
import { join, resolve } from 'path'
import fp from 'fastify-plugin'
import Swagger from 'fastify-swagger'

const { version } = JSON.parse(readFileSync(join(resolve(), 'package.json')))

async function swaggerGenerator(fastify) {
  fastify.register(Swagger, {
    routePrefix: '/doc',
    swagger: {
      info: {
        title: 'Political Dilemma Service',
        description: 'Political Dilemma Service documentation',
        version,
      },
      externalDocs: {
        url: 'https://github.com/fmenis/political-dilemma-service',
        description: 'Find more info here',
      },
      host:
        process.env.NODE_ENV === 'development'
          ? `localhost:${process.env.SERVER_PORT}`
          : process.env.DOMAIN_PROD,
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [
        { name: 'auth', description: 'Auth related end-points' },
        { name: 'sessions', description: 'Session related end-points' },
        { name: 'permissions', description: 'Permissions related end-points' },
        { name: 'roles', description: 'Roles related end-points' },
        { name: 'users', description: 'User related end-points' },
        {
          name: 'reset password',
          description: 'Reset password related end-points',
        },
        { name: 'misc', description: 'Miscellaneous related end-points' },
        { name: 'articles', description: 'Articles related end-points' },
        { name: 'files', description: 'Files related end-points' },
      ].sort((a, b) => a.name.localeCompare(b.name)),
    },
    // TODO passare a openApi v3
    exposeRoute: true,
  })
}

export default fp(swaggerGenerator)
