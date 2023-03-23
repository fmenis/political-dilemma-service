import fp from 'fastify-plugin'

async function politicianController(fastify) {
  const { politicianService } = fastify

  async function list(req, res) {
    const politicians = await politicianService.list()
    return politicians
  }

  fastify.decorate('politicianController', {
    list,
  })
}

export default fp(politicianController)
