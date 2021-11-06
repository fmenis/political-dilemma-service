import S from 'fluent-json-schema'

import { sUnauthorized, sForbidden } from '../lib/errorSchemas.js'

import createRoute from './create.js'
import listRoute from './list.js'
import readRoute from './read.js'
import deleteRoute from './delete.js'

export default async function index(fastify, opts) {
  fastify.addHook('onRoute', (routeOptions) => {
    // set common header and response schemas
    routeOptions.schema = {
      ...routeOptions.schema,
      headers: S.object()
        .additionalProperties(true)
        .prop('Cookie', S.string())
        .description('Autentication header')
        .required(),
      response: {
        ...routeOptions.schema.response,
        401: sUnauthorized(),
        403: sForbidden(),
      }
    }
  })

  const prefix = '/v1/users'
  fastify.register(createRoute, { prefix })
  fastify.register(listRoute, { prefix })
  fastify.register(readRoute, { prefix })
  fastify.register(deleteRoute, { prefix })
}