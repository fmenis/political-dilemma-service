import { readFileSync } from 'fs'
import { join, resolve } from 'path'
import fp from 'fastify-plugin'
import Swagger from '@fastify/swagger'
import { ENV } from '../common/enums.js'

const { version } = JSON.parse(readFileSync(join(resolve(), 'package.json')))

async function swaggerGenerator(fastify) {
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
      servers: [
        {
          url: `http://localhost:${process.env.SERVER_PORT}`,
          description: 'Local api',
          env: ENV.LOCAL,
        },
        {
          url: `https://${process.env.API_DOMAIN}`,
          description: 'Develop api',
          env: ENV.DEVELOPMENT,
        },
        {
          url: `https://${process.env.API_DOMAIN}`,
          description: 'Staging api',
          env: ENV.STAGING,
        },
      ].reduce((acc, item) => {
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
        { name: 'activities', description: 'Activities related end-points' },
      ].sort((a, b) => a.name.localeCompare(b.name)),
    },
    exposeRoute: process.env.NODE_ENV !== ENV.PRODUCTION,
  })
}

export default fp(swaggerGenerator)
