/**
 * Build paginated info
 * @param {number} totalCount total items
 * @param {Object} options pagination options
 * @param {Object} options.limit limit
 * @param {Object} options.offset limit
 * @returns {Object} paginatedInfo
 */
export function buildPaginatedInfo(totalCount, options) {
  const { limit, offset } = options

  // the 'count' method of massivejs returns a string...
  totalCount =
    typeof totalCount === 'string' ? parseInt(totalCount) : totalCount

  const pageCount = Math.ceil(totalCount / limit)
  const page = Math.ceil(offset / limit) + 1

  return {
    totalItems: totalCount,
    itemsPerPage: limit,
    pageCount,
    page,
    lastPage: page >= pageCount,
  }
}

/**
 * Determinates if the entities must be restricted by owner
 * @param {string} apiPermission permission
 * @returns boolean
 */
export function restrictDataToOwner(apiPermission) {
  return apiPermission.includes('own')
}
