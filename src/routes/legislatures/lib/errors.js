import Fp from 'fastify-plugin'
import _ from 'lodash'

async function groupErrors(fastify) {
  const { createError } = fastify.httpErrors

  function throwNotFoundError(data) {
    const { id, entity = 'legislature' } = data
    const message = `Entity '${entity}' '${id}' not found`
    throw createError(404, message, {
      internalCode: 'NOT_FOUND',
      details: { entityId: id, entityName: `${entity}` },
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

  function throwDuplicateMinistriesError(data) {
    const { duplicates } = data
    const message = `Duplicated ministries: '${duplicates.join(', ')}'`
    throw createError(409, message, {
      internalCode: 'DUPLICATE_MINISTRIES',
      details: { duplicates: duplicates.join(', ') },
    })
  }

  fastify.decorate('legislatureErrors', {
    throwNotFoundError,
    throwDuplicatedNameError,
    throwInvalidDatesError,
    throwDuplicateMinistriesError,
    errors: [
      {
        code: '*NOT_FOUND*',
        description: 'occurs when the target entity is not present.',
        apis: [
          'update',
          'add-ministries',
          'read',
          'delete',
          'duplicate',
          'update-ministry',
          'remove-ministries',
        ],
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
      {
        code: '*DUPLICATE_MINISTRIES*',
        description:
          'occurs when same ministry/minister are provider more that once.',
        apis: ['add-ministries'],
        statusCode: 409,
      },
    ],
  })
}

export default Fp(groupErrors)
