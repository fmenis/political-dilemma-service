import redis from 'redis'
import Fp from 'fastify-plugin'

async function redisClient(fastify) {
  const { log, config } = fastify

  const client = redis.createClient({
    socket: {
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
    },
  })

  await client.connect()

  log.debug('Redis client correctly connected')

  fastify.addHook('onClose', async () => {
    await client.disconnect()
  })

  fastify.decorate('redis', client)
}

export default Fp(redisClient)
