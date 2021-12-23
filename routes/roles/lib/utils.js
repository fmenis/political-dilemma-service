// TODO testare
export async function getRolePermissions(roleId, pg, permissionsIds) {
  if (!permissionsIds) {
    const query = 'SELECT permission_id FROM permissions_roles WHERE role_id=$1'
    const { rows } = await pg.execQuery(query, [roleId])
    permissionsIds = rows.map(obj => obj.permissionId)
  }

  const { rows } = await pg.execQuery(
    'SELECT id, resource, action, ownership ' +
      'FROM permissions WHERE id = ANY ($1)',
    [permissionsIds]
  )
  return rows
}
