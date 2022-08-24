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
 * Calculate base url related to the current envinronment
 */
export function calculateBaseUrl(opts = {}) {
  switch (process.env.NODE_ENV) {
    case 'production':
      return `https://${process.env.DOMAIN_PROD}`

    case 'staging': //TODO da fare
      return `https://${process.env.DOMAIN_STAGING}`

    case 'development':
      if (opts.excludePort) {
        return `http://${process.env.SERVER_ADDRESS}`
      }
      return `http://${process.env.SERVER_ADDRESS}:${process.env.SERVER_PORT}`
  }
}
