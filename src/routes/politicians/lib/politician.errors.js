import Fp from 'fastify-plugin'
import _ from 'lodash'

async function politicianErrors(fastify) {
  const { createError } = fastify.httpErrors

  function throwNotFoundError(data) {
    const { name, id } = data
    const message = `Entity ${name} '${id}' not found`
    throw createError(404, message, {
      internalCode: 'NOT_FOUND',
      details: { entityId: id, entityName: name },
    })
  }

  fastify.decorate('politicianErrors', {
    throwNotFoundError,
    errors: [
      {
        code: '*NOT_FOUND*',
        description: 'occurs when the target entity is not present.',
        apis: ['list'],
        statusCode: 404,
      },
    ],
  })
}

export default Fp(politicianErrors)
