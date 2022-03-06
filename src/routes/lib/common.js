/**
 * Build paginated info
 * @param {number} totalCount total items
 * @param {Object} paginationOptions pagination options
 * @returns {Object} paginatedInfo
 */
export function buildPaginatedInfo(totalCount, paginationOptions) {
  const { limit, offset } = paginationOptions

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
