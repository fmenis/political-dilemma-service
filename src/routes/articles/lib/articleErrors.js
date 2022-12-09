import Fp from 'fastify-plugin'

async function articleErrors(fastify) {
  const { createError } = fastify.httpErrors

  function throwNotFoundError(data) {
    const message = `Entity '${data.id}' not found`
    throw createError(404, message, {
      internalCode: 'NOT_FOUND',
      details: { articleId: data.id },
    })
  }

  function throwInvalidStatusError(data) {
    const { id, requiredStatus } = data
    const message = `Action not allowed on article '${id}'. Required status '${requiredStatus}'`
    throw createError(409, message, {
      internalCode: 'INVALID_STATUS',
      details: {
        articleId: id,
        requiredStatus,
      },
    })
  }

  function throwInvalidPublicationDateError(data) {
    const { publicationDate } = data
    const message = 'Publication date must be in the future'
    throw createError(400, message, {
      internalCode: 'INVALID_PUBLICATION_DATE',
      validation: [
        {
          message: `Publication date '${publicationDate}' must be in the future`,
        },
      ],
    })
  }

  function throwMissinDataError(data) {
    const { id, errors } = data
    const message = `Action not allowed on article '${id}' due to a lack of data`
    throw createError(400, message, {
      internalCode: 'MISSING_DATA',
      validation: errors,
    })
  }

  fastify.decorate('articleErrors', {
    throwNotFoundError,
    throwInvalidStatusError,
    throwInvalidPublicationDateError,
    throwMissinDataError,
    errors: [
      {
        code: '*NOT_FOUND*',
        description: 'occurs when the target article is not present.',
        apis: ['approve', 'review', 'rework'],
      },
      {
        code: '*INVALID_STATUS*',
        description:
          'occurs when the current status is not valid to perform the requested action.',
        apis: ['approve', 'review'],
      },
      {
        code: '*INVALID_PUBLICATION_DATE*',
        description: 'occurs when the publicationDate is not in the future.',
        apis: ['approve'],
      },
      {
        code: '*MISSING_DATA*',
        description: 'occurs when some article data is missing.',
        apis: ['review'],
      },
    ],
  })
}

export default Fp(articleErrors)
