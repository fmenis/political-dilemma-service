import S from 'fluent-json-schema'

import { sUnauthorized, sForbidden } from '../lib/errorSchemas.js'

import statusRoute from './status.js'

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

  const prefix = '/v1'
  fastify.register(statusRoute, { prefix })
}