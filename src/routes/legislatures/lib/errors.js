import Fp from 'fastify-plugin'
import _ from 'lodash'

async function groupErrors(fastify) {
  const { createError } = fastify.httpErrors

  function throwNotFoundError(data) {
    const { name, id } = data
    const message = `Entity ${name} '${id}' not found`
    throw createError(404, message, {
      internalCode: 'NOT_FOUND',
      details: { entityId: id, entityName: name },
    })
  }

  function throwDuplicatedNameError(data) {
    const { name } = data
    const message = `Name '${name}' already exists`
    throw createError(409, message, {
      internalCode: 'DUPLICATE_NAME',
      details: { duplicatedName: name },
    })
  }

  fastify.decorate('legislatureErrors', {
    throwNotFoundError,
    throwDuplicatedNameError,
    errors: [
      {
        code: '*NOT_FOUND*',
        description: 'occurs when the target entity is not present.',
        apis: [],
        statusCode: 404,
      },
      {
        code: '*DUPLICATED_NAME*',
        description: 'occurs when the name is already used.',
        apis: ['create'],
        statusCode: 409,
      },
    ],
  })
}

export default Fp(groupErrors)
