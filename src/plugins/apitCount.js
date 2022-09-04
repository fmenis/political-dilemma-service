import Fp from 'fastify-plugin'

async function apiCount(fastify) {
  async function countApiUsage(req, reply) {
    const { massive } = this

    const api = reply.context.schema.summary
      .split(' ')
      .reduce((acc, item) => {
        acc.push(item.toLowerCase())
        return acc
      }, [])
      .join('-')

    const responseTime = parseFloat(reply.getResponseTime().toFixed(3))
    await massive.apiCounts.save({ api, responseTime: responseTime })
  }

  fastify.addHook('onResponse', countApiUsage)
}

export default Fp(apiCount)
