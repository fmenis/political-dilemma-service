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
