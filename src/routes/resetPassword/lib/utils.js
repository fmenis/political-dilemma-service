import { randomBytes } from 'crypto'

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

export function deleteUserResetLinks(userId, pg) {
  return pg.execQuery('DELETE FROM reset_links WHERE user_id=$1', [userId])
}
