import Fp from 'fastify-plugin'

async function roleErrors(fastify) {
  const { createError } = fastify.httpErrors

  function throwNotFoundError(data) {
    const { name, id } = data
    const message = `Entity ${name} '${id}' not found`
    throw createError(404, message, {
      internalCode: 'NOT_FOUND',
      details: { entityId: id, entityName: name },
    })
  }

  function throwRoleAssignedError(data) {
    const { id } = data
    const message = `Action not allowed on role '${id}'. Role is assigned to one or more users`
    throw createError(409, message, {
      internalCode: 'ROLE_ASSIGNED',
      details: {
        roleId: id,
      },
    })
  }

  fastify.decorate('roleErrors', {
    throwNotFoundError,
    throwRoleAssignedError,
    errors: [
      {
        code: '*NOT_FOUND*',
        description: 'occurs when the target role is not present.',
        apis: ['delete'],
        statusCode: 404,
      },
      {
        code: '*ROLE_ASSIGNED*',
        description:
          'occurs when the target role is assigned to one or more users.',
        apis: ['delete'],
        statusCode: 409,
      },
    ],
  })
}

export default Fp(roleErrors)
