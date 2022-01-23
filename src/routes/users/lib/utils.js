import { randomBytes } from 'crypto'

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

export function generateRandomToken(bytes) {
  return new Promise((resolve, reject) => {
    randomBytes(bytes, (err, buffer) => {
      if (err) {
        return reject(err)
      }
      resolve(buffer.toString('hex'))
    })
  })
}
