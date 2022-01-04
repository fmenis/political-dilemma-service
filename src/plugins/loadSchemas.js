import fp from 'fastify-plugin'

import { sNoContent } from '../routes/lib/responseSchemas.js'
import {
  sBadRequest,
  sForbidden,
  sUnauthorized,
  sNotFound,
  sConflict,
} from '../routes/lib/errorSchemas.js'

async function loadSchemas(fastify) {
  fastify.addSchema(sNoContent())
  fastify.addSchema(sBadRequest())
  fastify.addSchema(sForbidden())
  fastify.addSchema(sUnauthorized())
  fastify.addSchema(sNotFound())
  fastify.addSchema(sConflict())
}

export default fp(loadSchemas)
