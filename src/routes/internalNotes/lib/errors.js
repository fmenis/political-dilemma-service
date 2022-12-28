import Fp from 'fastify-plugin'

async function internalNotesErrors(fastify) {
  const { createError } = fastify.httpErrors

  function throwNotFoundError(data) {
    const { name, id } = data
    const message = `Entity ${name} '${id}' not found`
    throw createError(404, message, {
      internalCode: 'NOT_FOUND',
      details: { entityId: id, entityName: name },
    })
  }

  fastify.decorate('internalNotesErrors', {
    throwNotFoundError,
    errors: [
      {
        code: '*NOT_FOUND*',
        description: 'occurs when the target entity is not present.',
        apis: ['create', 'list'],
      },
    ],
  })
}

export default Fp(internalNotesErrors)
