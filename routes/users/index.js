import S from 'fluent-json-schema'

import { sUnauthorized, sForbidden } from '../lib/errorSchemas.js'

import createRoute from './create.js'
import readRoute from './read.js'
import deleteRoute from './delete.js'

export default async function index(fastify, opts) {
  fastify.addHook('onRoute', (routeOptions) => {
    // set common prefix
    const prefix = routeOptions.routePath ? 
      `${routeOptions.prefix}/v1/users${routeOptions.routePath}` :
      `${routeOptions.prefix}/v1/users`

    routeOptions.url = prefix
    routeOptions.path = prefix
    
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

  fastify.register(createRoute)
  fastify.register(readRoute)
  fastify.register(deleteRoute)
}