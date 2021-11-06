import { readFileSync } from 'fs'
import { join, resolve } from 'path'
import fp from 'fastify-plugin'
import Swagger from 'fastify-swagger'

const { version } = JSON.parse(readFileSync(join(resolve(), 'package.json')))

async function swaggerGenerator (fastify, opts) {
  fastify.register(Swagger, {
    routePrefix: '/doc',
    swagger: {
      info: {
        title: 'Political Dilemma Service',
        description: 'Political Dilemma Service documentation',
        version
      },
      externalDocs: {
        url: 'https://github.com/fmenis/political-dilemma-service',
        description: 'Find more info here'
      },
      host: 'localhost:3000',
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [
        { name: 'auth', description: 'Auth related end-points' },
        { name: 'users', description: 'User related end-points' },
        { name: 'misc', description: 'Miscellaneous related end-points' }
      ],
    },
    exposeRoute: fastify.config.NODE_ENV !== 'production'
  })
}

export default fp(swaggerGenerator)