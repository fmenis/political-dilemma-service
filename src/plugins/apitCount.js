import Fp from 'fastify-plugin'

async function apiCount(fastify) {
  async function countApiUsage(reply) {
    const { massive } = this

    const api = reply.context.schema.summary
      .split(' ')
      .reduce((acc, item) => {
        acc.push(item.toLowerCase())
        return acc
      }, [])
      .join('-')

    const apiLog = await massive.apiCounts.findOne({ api })

    if (!apiLog) {
      await massive.apiCounts.save({ api, count: 1 })
    } else {
      await massive.apiCounts.save({ id: apiLog.id, count: ++apiLog.count })
    }
  }

  fastify.addHook('onResponse', countApiUsage)
}

export default Fp(apiCount)
