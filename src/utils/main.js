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
