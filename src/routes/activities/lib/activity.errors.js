import Fp from 'fastify-plugin'

async function activityErrors(fastify) {
  const { createError } = fastify.httpErrors

  function throwNotFoundError(data) {
    const { name, id } = data
    const message = `Entity ${name} '${id}' not found`
    throw createError(404, message, {
      internalCode: 'NOT_FOUND',
      details: { entityId: id, entityName: name },
    })
  }

  function throwInvalidCategoryError(data) {
    const { type, id } = data
    const message = `Invalid category type '${type}'. Required: 'ACTIVITY'`
    throw createError(409, message, {
      internalCode: 'INVALID_CATEGORY_TYPE',
      details: { entityId: id, categoryType: type },
    })
  }

  function throwDuplicateTitleError(data) {
    const { title } = data
    const message = `Title '${title}' already exists`
    throw createError(409, message, {
      internalCode: 'DUPLICATE_TITLE',
      details: { duplicatedTitle: title },
    })
  }

  fastify.decorate('activityErrors', {
    throwNotFoundError,
    throwInvalidCategoryError,
    throwDuplicateTitleError,
    errors: [
      {
        code: '*NOT_FOUND*',
        description: 'occurs when the target entity is not present.',
        apis: ['create'],
      },
      {
        code: '*INVALID_CATEGORY_TYPE*',
        description: 'occurs when the category type is invalid.',
        apis: ['create'],
      },
      {
        code: '*DUPLICATE_TITLE*',
        description: 'occurs when the title is already used.',
        apis: ['create'],
      },
    ],
  })
}

export default Fp(activityErrors)
