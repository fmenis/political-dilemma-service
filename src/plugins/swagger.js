import { readFileSync } from 'fs'
import { join, resolve } from 'path'
import fp from 'fastify-plugin'
import Swagger from '@fastify/swagger'
import { ENV } from '../common/enums.js'

const { version } = JSON.parse(readFileSync(join(resolve(), 'package.json')))

async function swaggerGenerator(fastify) {
  const servers = [
    {
      url: `http://localhost:${process.env.SERVER_PORT}`,
      description: 'Development server',
      env: ENV.DEVELOPMENT,
    },
    //TODO
    // {
    //   url: `https://${process.env.DOMAIN_STAGING}`,
    //   description: 'Staging server',
    //   env: ENV.STAGING,
    // },
    {
      url: `https://${process.env.DOMAIN_PROD}`,
      description: 'Production server',
      env: ENV.PRODUCTION,
    },
  ]

  fastify.register(Swagger, {
    routePrefix: '/doc',
    openapi: {
      info: {
        title: 'Political Dilemma Service',
        description: 'Political Dilemma Service documentation',
        version,
        contact: {
          name: 'API Support',
          email: 'filippomeniswork@gmail.com',
        },
      },
      externalDocs: {
        url: 'https://github.com/fmenis/political-dilemma-service',
        description: 'Find more info here',
      },
      servers: servers.reduce((acc, item) => {
        if (item.env === process.env.NODE_ENV) {
          acc.push({
            url: item.url,
            description: item.description,
          })
        }
        return acc
      }, []),
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
        {
          name: 'internalNotes',
          description: 'Internal notes related end-points',
        },
        { name: 'files', description: 'Files related end-points' },
      ].sort((a, b) => a.name.localeCompare(b.name)),
    },
    exposeRoute: true,
  })
}

export default fp(swaggerGenerator)
