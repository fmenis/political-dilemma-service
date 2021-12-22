import S from 'fluent-json-schema'

export default async function removeRoles(fastify) {
  const { pg, httpErrors } = fastify
  const { createError } = httpErrors

  fastify.route({
    method: 'POST',
    path: '/remove',
    config: {
      public: false,
    },
    schema: {
      summary: 'Remove roles',
      description: 'Remove roles from a user.',
      body: S.object()
        .additionalProperties(false)
        .prop('userId', S.number())
        .description('TODO')
        .required()
        .prop('rolesIds', S.array().items([S.number()]).maxItems(50))
        .description('Role ids to be removed from the user')
        .required(),
      response: {
        204: fastify.getSchema('sNoContent'),
      },
    },
    preHandler: onPreHandler,
    handler: onRemoveRoles,
  })

  async function onPreHandler(req) {
    const { userId, rolesIds } = req.body

    const user = await pg.execQuery(
      'SELECT id FROM users WHERE id=$1',
      [userId],
      { findOne: true }
    )

    if (!user) {
      throw httpErrors.notFound(`User with id '${userId}' not found`)
    }

    const duplicates = rolesIds.reduce((acc, id, index, array) => {
      if (array.indexOf(id) !== index && !acc.includes(id)) {
        acc.push(id)
      }
      return acc
    }, [])

    if (duplicates.length) {
      throw createError(400, 'Invalid input', {
        validation: [
          {
            message: `Duplicate roles ids: ${duplicates.join(', ')}`,
          },
        ],
      })
    }

    // controllare che uno dei ruoli non sia stato già assegnato
    // controllare che tutti i ruoli esistano
  }

  async function onRemoveRoles(req) {
    const { userId, rolesIds } = req.body

    let client

    try {
      client = await pg.beginTransaction()

      await removeRoles(userId, rolesIds, client)

      await pg.commitTransaction(client)
      return 'OK' //TODO togliere appena si capisce
    } catch (error) {
      await pg.rollbackTransaction(client)
      throw error
    }
  }

  async function removeRoles(userId, rolesIds, client) {
    const query =
      'DELETE FROM users_roles WHERE role_id = ANY($2) AND user_id=$1'
    return pg.execQuery(query, [userId, rolesIds], {
      client,
    })
  }
}
