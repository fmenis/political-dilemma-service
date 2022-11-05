import Fp from 'fastify-plugin'

import { generateRouteAction, getUUIDFromUrl } from '../utils/main.js'

async function activityLog(fastify) {
  async function insertLogActivity(req, reply) {
    const { massive, config } = this
    const { user } = req

    const action = generateRouteAction(reply)

    const writeCalls = ['POST', 'PUT', 'PATCH', 'DELETE']
    const notInterestingActions = ['login', 'logout', 'upload-files']

    if (
      !config.ENABLE_LOG_ACTIVITY ||
      !user ||
      !writeCalls.includes(req.method) ||
      notInterestingActions.includes(action) ||
      reply.statusCode > 300
    ) {
      return
    }

    await massive.activityLog.save({
      action,
      resourceId: getUUIDFromUrl(req.url) || reply.resourceId || null,
      httpMethod: req.method,
      statusCode: reply.statusCode,
      userId: user.id,
      userEmail: user.email,
      payload: req.body,
    })
  }

  fastify.addHook('onResponse', insertLogActivity)
}

export default Fp(activityLog)
