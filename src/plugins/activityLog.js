import Fp from 'fastify-plugin'

import {
  generateRouteAction,
  getUUIDFromUrl,
  isObjectEmpty,
} from '../utils/main.js'

async function activityLog(fastify) {
  async function insertLogActivity(req, reply) {
    const { massive, config } = this
    const { user } = req

    const action = generateRouteAction(req)

    const writeCalls = ['POST', 'PUT', 'PATCH', 'DELETE']
    const notInterestingActions = [
      'login',
      'logout',
      'upload-files',
      'delete-sessions',
    ]

    if (
      !config.ENABLE_LOG_ACTIVITY ||
      !user ||
      user.type !== 'backoffice' ||
      !writeCalls.includes(req.method) ||
      notInterestingActions.includes(action) ||
      reply.statusCode > 300
    ) {
      return
    }

    await massive.activityLog.save({
      action,
      resourceId: getUUIDFromUrl(req.url) || reply.resourceId || null,
      userId: user.id,
      userEmail: user.email,
      payload:
        req.body && !isObjectEmpty(req.body) ? redactPayload(req.body) : null,
    })
  }

  function redactPayload(body) {
    for (const key of Object.keys(body)) {
      if (key.includes('asswor')) {
        body[key] = '**GDPR COMPLIANT**'
      }
    }
    return body
  }

  fastify.addHook('onResponse', insertLogActivity)
}

export default Fp(activityLog)
