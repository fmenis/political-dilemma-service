import Fp from 'fastify-plugin'

async function apiAuditPlugin(fastify) {
  async function persistApiAudit(req, reply) {
    const { massive, config } = this

    if (!config.ENABLE_API_AUDIT) {
      return
    }

    const api = reply.context.schema.summary
      .split(' ')
      .reduce((acc, item) => {
        acc.push(item.toLowerCase())
        return acc
      }, [])
      .join('-')

    await massive.apiAudit.save({
      api,
      responseTime: parseFloat(reply.getResponseTime().toFixed(3)),
      httpMethod: req.method,
      statusCode: reply.statusCode,
      userEmail: req.user ? req.user.email : null,
    })
  }

  fastify.addHook('onResponse', persistApiAudit)
}

export default Fp(apiAuditPlugin)
