export async function getUserRoles(usersIds, pg) {
  const query =
    'SELECT u.id AS user_id, ro.name ' +
    'FROM users AS u ' +
    'JOIN users_roles AS us ON u.id = us.user_id ' +
    'JOIN roles AS ro ON us.role_id = ro.id ' +
    'WHERE u.id = ANY($1)'

  const { rows } = await pg.execQuery(query, [usersIds])
  return rows
}

/**
 * Get raw (eg: session:read:own) user permissons
 * @param {string} userId user id
 * @param {object} pg postgres client
 * @returns Promise<string[]>
 */
export async function getRawUserPermissions(userId, pg) {
  const query =
    'SELECT p.resource, p.action, p.ownership FROM permissions_roles ' +
    'AS pr LEFT JOIN permissions AS p ON pr.permission_id = p.id ' +
    'WHERE pr.role_id=ANY(SELECT role_id FROM users_roles WHERE user_id=$1)'

  const { rows } = await pg.execQuery(query, [userId])

  const permissions = rows.map(row => {
    return row.ownership
      ? `${row.resource}:${row.action}:${row.ownership}`
      : `${row.resource}:${row.action}`
  })

  return permissions
}
