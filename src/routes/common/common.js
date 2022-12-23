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

/**
 * Build OpenAPI route description
 * @param {string} version route version
 * @param {string} description route description
 * @param {Object[]} [errors] route possibile errors
 * @param {string} [permission] route permission
 * @param {string} [api] route error identifier
 * @returns string
 */
export function buildRouteFullDescription(params) {
  const { version, description, errors = [], api, permission } = params

  let fullDescription = `${description} \n\n `

  //TODO togliere quando nuovo versionamento api è in atto
  if (version) {
    fullDescription += `**Api version**: ${version} \n\n `
  }

  if (errors.length > 0) {
    const formattedErrors = errors
      .filter(item => item.apis.includes(api))
      .map(item => `- ${item.code}: ${item.description} \n\n`)

    fullDescription += ` **Possible errors**: \n\n ${formattedErrors.join(' ')}`
  }

  if (permission) {
    fullDescription += `**Required permission**: *${permission}*.`
  }

  return fullDescription
}

/**
 * Trim target object fields (in place)
 * @param {string[]} fields fields to trim
 * @param {Object[]} obj target object
 * @returns target object
 */
export function trimObjectFields(fields, obj) {
  for (const key of Object.keys(obj)) {
    const value = obj[key]
    if (value && fields.includes(key)) {
      if (Array.isArray(value)) {
        obj[key] = value.map(item => item.trim())
      } else {
        obj[key] = obj[key].trim()
      }
    }
  }
  return obj
}
