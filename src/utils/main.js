import { ENV } from '../common/enums.js'

/**
 * Find duplicated inside the target array
 */
export function findArrayDuplicates(array) {
  return array.reduce((acc, id, index, array) => {
    if (array.indexOf(id) !== index && !acc.includes(id)) {
      acc.push(id)
    }
    return acc
  }, [])
}

/**
 * Create an object copy without target props
 */
export function removeObjectProps(obj, propsToRemove) {
  return Object.keys(obj).reduce((acc, key) => {
    if (!propsToRemove.includes(key)) {
      acc[key] = obj[key]
    }

    return acc
  }, {})
}

/**
 * Calculate base url related to the current envinronment
 */
export function calculateBaseUrl(opts = {}) {
  if (process.env.NODE_ENV === ENV.LOCAL) {
    if (opts.port) {
      return `http://${process.env.SERVER_ADDRESS}:${opts.port}`
    }
    return `http://${process.env.SERVER_ADDRESS}:${process.env.SERVER_PORT}`
  }

  return `https://${process.env.API_DOMAIN}`
}

/**
 * Generate readable route action from reply context
 */
export function generateRouteAction(reply) {
  return reply.context.schema.summary
    .split(' ')
    .reduce((acc, item) => {
      acc.push(item.toLowerCase())
      return acc
    }, [])
    .join('-')
}

/**
 * Get a valid UUID (v4) from a string
 */
export function getUUIDFromUrl(str) {
  return str.match(/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/i)[0]
}
