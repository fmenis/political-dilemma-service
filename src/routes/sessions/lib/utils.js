/**
 * Delete multiple sessions by ids
 * @param {string[]} sessionsIds sessions ids
 * @param {Object} pg postgres client
 * @returns Promise<void>
 */
export function deleteSessions(sessionsIds, pg) {
  return pg.execQuery('DELETE FROM sessions WHERE id=ANY($1)', [sessionsIds])
}
