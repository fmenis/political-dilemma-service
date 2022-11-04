import Fp from 'fastify-plugin'

import { generateRouteAction, getUUIDFromUrl } from '../utils/main.js'

async function activityLog(fastify) {
  async function insertLogActivity(req, reply) {
    const { massive, config } = this
    const { user } = req

    if (
      !config.ENABLE_LOG_ACTIVITY ||
      !user ||
      !['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)
    ) {
      return
    }

    await massive.activityLog.save({
      action: generateRouteAction(reply),
      resourceId: getUUIDFromUrl(req.url),
      httpMethod: req.method,
      url: req.url,
      statusCode: reply.statusCode,
      userId: user.id,
      userEmail: user.email,
      payload: req.body || {},
    })
  }

  fastify.addHook('onResponse', insertLogActivity)
}

export default Fp(activityLog)
