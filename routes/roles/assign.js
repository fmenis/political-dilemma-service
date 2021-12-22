import S from 'fluent-json-schema'

export default async function assignRoles(fastify) {
  const { pg, httpErrors } = fastify
  const { createError } = httpErrors

  fastify.route({
    method: 'POST',
    path: '/assign',
    config: {
      public: false,
    },
    schema: {
      summary: 'Assign roles',
      description: 'Assign roles to a user.',
      body: S.object()
        .additionalProperties(false)
        .prop('userId', S.number())
        .description('TODO')
        .required()
        .prop('rolesIds', S.array().items([S.number()]).maxItems(50))
        .description('Role ids to be assigned to the user')
        .required(),
      response: {
        204: fastify.getSchema('sNoContent'),
      },
    },
    preHandler: onPreHandler,
    handler: onAssignRoles,
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

  async function onAssignRoles(req) {
    const { userId, rolesIds } = req.body

    let client

    try {
      client = await pg.beginTransaction()

      await associateRoles(userId, rolesIds, client)

      await pg.commitTransaction(client)
      return 'OK' //TODO togliere appena si capisce
    } catch (error) {
      await pg.rollbackTransaction(client)
      throw error
    }
  }

  function associateRoles(userId, rolesIds, client) {
    const baseQuery = 'INSERT INTO users_roles (user_id, role_id) VALUES'
    const inputs = [userId]

    const valuesQuery = rolesIds
      .reduce((acc, roleId) => {
        inputs.push(roleId)
        const values = `($1, $${inputs.length})`
        acc.push(values)
        return acc
      }, [])
      .join(', ')

    const query = `${baseQuery} ${valuesQuery}`
    return pg.execQuery(query, inputs, {
      client,
    })
  }
}
