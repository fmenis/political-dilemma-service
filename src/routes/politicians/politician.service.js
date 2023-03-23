import fp from 'fastify-plugin'

async function politicianService(fastify) {
  const { massive } = fastify

  async function list() {
    const politicians = await massive.politician.find({})
    return politicians
  }

  fastify.decorate('politicianService', {
    list,
  })
}

export default fp(politicianService)
