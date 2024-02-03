import Fp from 'fastify-plugin'
import _ from 'lodash'

async function groupErrors(fastify) {
  const { createError } = fastify.httpErrors

  function throwNotFoundError(data) {
    const { id } = data
    const message = `Entity 'legislature' '${id}' not found`
    throw createError(404, message, {
      internalCode: 'NOT_FOUND',
      details: { entityId: id, entityName: 'legislature' },
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

  function throwInvalidDatesError(data) {
    const { startDate, endDate } = data
    const message = `EndDate '${endDate}' must be after startDate '${startDate}'`
    throw createError(409, message, {
      internalCode: 'INVALID_DATES',
      details: { startDate, endDate },
    })
  }

  fastify.decorate('legislatureErrors', {
    throwNotFoundError,
    throwDuplicatedNameError,
    throwInvalidDatesError,
    errors: [
      {
        code: '*NOT_FOUND*',
        description: 'occurs when the target entity is not present.',
        apis: ['update'],
        statusCode: 404,
      },
      {
        code: '*DUPLICATED_NAME*',
        description: 'occurs when the name is already used.',
        apis: ['create', 'update'],
        statusCode: 409,
      },
      {
        code: '*INVALID_DATES*',
        description:
          'occurs when the left date is lower or equal to the right date (date range).',
        apis: ['create', 'update'],
        statusCode: 409,
      },
    ],
  })
}

export default Fp(groupErrors)
