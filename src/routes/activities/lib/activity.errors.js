import Fp from 'fastify-plugin'

async function activityErrors(fastify) {
  const { createError } = fastify.httpErrors

  function throwNotFoundError(data) {
    const message = `Entity '${data.id}' not found`
    throw createError(404, message, {
      internalCode: 'NOT_FOUND',
      details: { activityId: data.id },
    })
  }

  fastify.decorate('activityErrors', {
    throwNotFoundError,
    errors: [
      {
        code: '*NOT_FOUND*',
        description: 'occurs when the target activity is not present.',
        apis: ['create'],
      },
    ],
  })
}

export default Fp(activityErrors)
