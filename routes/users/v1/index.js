
import createRoute from './create.js'

export default async function index(fastify, opts) {
  // test
  fastify.addHook('preHandler', async (req, reply) => {
    for (const key of reply.context.config.trimFields) {
      if (req.body[key]) {
        req.body[key] = req.body[key].trim()
      }
    }
  })
  fastify.register(createRoute)
}