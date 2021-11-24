import Fastify from 'fastify'

import App from './app.js'

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL,
    prettyPrint: process.env.NODE_ENV !== 'production',
  },
})

fastify.register(App)

const port = process.env.SERVER_PORT || 3000
const address = process.env.SERVER_ADDRESS || '127.0.0.1'

fastify.listen(port, address, err => {
  if (err) {
    fastify.log.fatal(err)
    throw err
  }
  fastify.log.debug(`Server launched in ${process.env.NODE_ENV} mode`)
})

/**
 * TODO
 * - gracefull shutdown
 */
