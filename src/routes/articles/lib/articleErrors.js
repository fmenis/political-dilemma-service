import Fp from 'fastify-plugin'

async function articleErrors(fastify) {
  const { createError } = fastify.httpErrors

  function throwNotFound(data) {
    const message = `Entity '${data.id}' not found`
    throw createError(404, message, {
      internalCode: 'NOT_FOUND',
      details: { articleId: data.id },
    })
  }

  function throwInvalidAction(data) {
    const { id, requiredStatus } = data
    const message = `Invalid action on article '${id}'. Required status '${requiredStatus}'`
    throw createError(409, message, {
      internalCode: 'INVALID_ACTION',
      details: {
        articleId: id,
        requiredStatus,
      },
    })
  }

  function throwInvalidPublicationDate(data) {
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

  fastify.decorate('articleErrors', {
    throwNotFound,
    throwInvalidAction,
    throwInvalidPublicationDate,
  })
}

export default Fp(articleErrors)
