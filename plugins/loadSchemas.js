import fp from 'fastify-plugin'

import { 
  sBadRequest, sForbidden, sNoContent, sUnauthorized, sNotFound, sConflict
} from '../routes/lib/errorSchemas.js'

async function loadSchemas (fastify) {
  fastify.addSchema(sBadRequest())
  fastify.addSchema(sForbidden())
  fastify.addSchema(sNoContent())
  fastify.addSchema(sUnauthorized())
  fastify.addSchema(sNotFound())
  fastify.addSchema(sConflict())
}

export default fp(loadSchemas)