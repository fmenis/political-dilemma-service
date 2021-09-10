import { readFileSync } from 'fs'
import { join, resolve } from 'path'
import fp from 'fastify-plugin'
import Swagger from 'fastify-swagger'

const { version } = JSON.parse(readFileSync(join(resolve(), 'package.json')))

async function swaggerGenerator (fastify, opts) {
  fastify.register(Swagger, {
    routePrefix: '/documentation',
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
      host: 'localhost:3000', // and your deployed url
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [
        { name: 'users', description: 'User related end-points' },
        { name: 'miscellaneous', description: 'Miscellaneous related end-points' }
      ],
      // securityDefinitions: {
      //   Bearer: {
      //     type: 'apiKey',
      //     name: 'Bearer',
      //     in: 'header'
      //   },
      //   Csrf: {
      //     type: 'apiKey',
      //     name: 'x-csrf-token',
      //     in: 'header'
      //   }
      // }
    },
    exposeRoute: process.env.NODE_ENV !== 'production'
  })
}

export default fp(swaggerGenerator)