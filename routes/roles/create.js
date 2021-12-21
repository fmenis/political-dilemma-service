// import _ from 'lodash'

import { sCreateRole, sRoleResponse } from './lib/schema.js'

export default async function createRole(fastify) {
  const { pg /*, httpErrors*/ } = fastify
  // const { createError } = httpErrors

  fastify.route({
    method: 'POST',
    path: '',
    config: {
      public: false,
    },
    schema: {
      summary: 'Create role',
      description: 'Create role.',
      body: sCreateRole(),
      response: {
        201: sRoleResponse(),
      },
    },
    // preHandler: onPreHandler,
    handler: onCreateRole,
  })

  // async function onPreHandler(req) {
  //   const { permissionsIds } = req.body

  //   const { rows } = await pg.execQuery(
  //     'SELECT id FROM permissions WHERE id = ANY ($1)',
  //     permissionsIds
  //   )

  //   //TODO testare
  //   if (rows.length !== permissionsIds.length) {
  //     const missingPermissionsIds = _.difference(rows, permissionsIds)

  //     throw createError(400, 'Invalid input', {
  //       validation: [
  //         {
  //           message: `Missing: ${missingPermissionsIds.join(', ')}`,
  //         },
  //       ],
  //     })
  //   }
  // }

  async function onCreateRole(req) {
    const { name, description, permissionsIds } = req.body

    let client

    try {
      client = await pg.beginTransaction()

      const role = await insertRole(name, description, client)

      await associatePermissions(role.id, permissionsIds, client)

      await pg.commitTransaction(client)

      role.permissions = await getRolePermissions(permissionsIds)

      return role
    } catch (error) {
      await pg.rollbackTransaction(client)
      throw error
    }
  }

  async function associatePermissions(roleId, permissionsIds, client) {
    const query =
      'INSERT INTO permissions_roles (role_id, permission_id) ' +
      'VALUES ($1, $2)'

    await Promise.all(
      permissionsIds.map(id => {
        pg.execQuery(query, [roleId, id], {
          client,
        })
      })
    )
  }

  async function insertRole(name, description, client) {
    const query =
      'INSERT INTO roles (name, description) ' +
      'VALUES ($1, $2) RETURNING id, name, description'

    const role = await pg.execQuery(query, [name, description], {
      findOne: true,
      client,
    })

    return role
  }

  async function getRolePermissions(permissionsIds) {
    const { rows } = await pg.execQuery(
      'SELECT id, resource, action, ownership ' +
        'FROM permissions WHERE id = ANY ($1)',
      [permissionsIds]
    )
    return rows
  }
}
