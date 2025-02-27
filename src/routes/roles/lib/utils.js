export async function getRolePermissions(roleId, pg, permissionsIds) {
  if (!permissionsIds) {
    const query = 'SELECT permission_id FROM permissions_roles WHERE role_id=$1'
    const { rows } = await pg.execQuery(query, [roleId])
    permissionsIds = rows.map(obj => obj.permissionId)
  }

  const { rows } = await pg.execQuery(
    'SELECT id, resource, action, ownership, description ' +
      'FROM permissions WHERE id = ANY ($1)',
    [permissionsIds]
  )
  return rows
}

/**
 * Associate permissions to a role
 */
export async function associatePermissions(roleId, permissionsIds, pg, client) {
  const baseQuery =
    'INSERT INTO permissions_roles (role_id, permission_id) VALUES'
  const inputs = [roleId]

  const valuesQuery = permissionsIds
    .reduce((acc, id) => {
      inputs.push(id)
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

export async function getRole(id, pg) {
  const res = await getRoles([id], pg)
  return res[0]
}

export async function getRoles(ids, pg) {
  const { rows } = await pg.execQuery(
    'SELECT * FROM roles WHERE id= ANY ($1)',
    [ids]
  )
  return rows
}

export async function getPermissions(ids, pg) {
  const { rows: permissions } = await pg.execQuery(
    'SELECT id FROM permissions WHERE id= ANY ($1)',
    [ids]
  )
  return permissions
}

/**
 * Associate roles to a user
 */
export function associateRoles(userId, reqUserId, rolesIds, pg, client) {
  const baseQuery =
    'INSERT INTO users_roles (user_id, assign_by, role_id) VALUES'
  const inputs = [userId, reqUserId]

  const valuesQuery = rolesIds
    .reduce((acc, roleId) => {
      inputs.push(roleId)
      const values = `($1, $2, $${inputs.length})`
      acc.push(values)
      return acc
    }, [])
    .join(', ')

  const query = `${baseQuery} ${valuesQuery}`
  return pg.execQuery(query, inputs, {
    client,
  })
}

/**
 * Remove roles from a user
 */
export function removeUserRole(userId, pg, client) {
  const query = 'DELETE FROM users_roles WHERE user_id=$1'
  return pg.execQuery(query, [userId], {
    client,
  })
}
