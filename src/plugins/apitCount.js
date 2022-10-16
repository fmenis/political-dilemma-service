import Fp from 'fastify-plugin'

async function apiCount(fastify) {
  async function countApiUsage(req, reply) {
    const { massive, config } = this

    if (!config.WRITE_API_COUNTS) {
      return
    }

    const api = reply.context.schema.summary
      .split(' ')
      .reduce((acc, item) => {
        acc.push(item.toLowerCase())
        return acc
      }, [])
      .join('-')

    await massive.apiCounts.save({
      api,
      responseTime: parseFloat(reply.getResponseTime().toFixed(3)),
      httpMethod: req.method,
      statusCode: reply.statusCode,
    })
  }

  fastify.addHook('onResponse', countApiUsage)
}

export default Fp(apiCount)
