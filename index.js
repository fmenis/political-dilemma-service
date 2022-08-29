import Fastify from 'fastify'
import { stdTimeFunctions } from 'pino'

import App from './src/app.js'

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL,
    timestamp: () => stdTimeFunctions.isoTime(),
    redact: {
      paths: [
        'password',
        'confirmPassword',
        'oldPassword',
        'newPassword',
        'newPasswordConfirmation',
        'token',
      ],
      censor: '**GDPR COMPLIANT**',
    },
  },
  trustProxy: true,
  ajv: {
    customOptions: {
      allErrors: true,
    },
  },
})

fastify.register(App)

const port = process.env.SERVER_PORT || 3000
const host = process.env.SERVER_ADDRESS || '127.0.0.1'

fastify.listen({ port, host }, err => {
  if (err) {
    fastify.log.fatal(err)
    throw err
  }
  fastify.log.debug(`Server launched in '${process.env.NODE_ENV}' mode`)
})

/**
 * TODO
 * - gracefull shutdown
 * - impostare la joinedDay dentro API di invito utente
 */
