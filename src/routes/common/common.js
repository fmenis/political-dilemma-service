import { STATES } from './enums.js'

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
 * @param {string} description route description
 * @param {Object[]} [errors] route possibile errors
 * @param {string} [permission] route permission
 * @param {string} [api] route error identifier
 * @returns string
 */
export function buildRouteFullDescription(params) {
  const { description, errors = [], api, permission } = params

  let fullDescription = `${description} \n\n `
  const apiErrors = errors.filter(item => item.apis.includes(api))

  if (apiErrors.length > 0) {
    const formattedErrors = apiErrors.map(
      item => `- ${item.code}: ${item.description} \n\n`
    )

    fullDescription += ` **Possible errors**: \n\n ${formattedErrors.join(' ')}`
  } else {
    fullDescription += ` **This api doesn't expose custom errors.** \n\n`
  }

  if (permission) {
    fullDescription += `**Required permission**: *${permission}*.`
  } else {
    fullDescription += `**No permission required to consume the api**.`
  }

  return fullDescription
}

/**
 * Calculate entity allowed actions
 * @param {string} status entity status
 * @returns object allowed actions
 */
export function buildAllowedActions(status) {
  const allowedActions = {
    canBeDeleted: false,
    canBeEdited: false,
    canAskReview: false,
    canAskApprove: false,
    canAskRework: false,
    canAskPublish: false,
    canAskArchive: false,
    canAskDelete: false,
  }

  if (status === STATES.DRAFT) {
    allowedActions.canBeDeleted = true
  }

  if (status !== STATES.ARCHIVED && status !== STATES.DELETED) {
    allowedActions.canBeEdited = true
  }

  if (status === STATES.DRAFT) {
    allowedActions.canAskReview = true
  }

  if (status === STATES.IN_REVIEW) {
    allowedActions.canAskApprove = true
    allowedActions.canAskRework = true
  }

  if (status === STATES.REWORK) {
    allowedActions.canAskReview = true
  }

  if (status === STATES.READY) {
    allowedActions.canAskPublish = true
  }

  if (status === STATES.PUBLISHED) {
    allowedActions.canAskArchive = true
  }

  if (status !== STATES.DRAFT && status !== STATES.DELETED) {
    allowedActions.canAskDelete = true
  }

  return allowedActions
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

export function isFutureDate(date) {
  return checkDate(date, { isFutureDate: true })
}

function checkDate(date, opts = {}) {
  date = new Date(date).toISOString()
  const now = new Date().toISOString()

  if (opts.isFutureDate && date > now) {
    return true
  }

  if (opts.isPastDate && date < now) {
    return true
  }

  return false
}
