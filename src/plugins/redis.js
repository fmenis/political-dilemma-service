import redis from 'redis'
import Fp from 'fastify-plugin'

async function redisClient(fastify) {
  const { log } = fastify

  const client = redis.createClient({
    socket: {
      host: fastify.config.REDIS_HOST,
      port: fastify.config.REDIS_PORT,
    },
  })

  await client.connect()

  log.debug('Redis client correctly connected')

  client.on('error', err => {
    log.error(err)
  })

  fastify.addHook('onClose', async () => {
    await client.disconnect()
  })

  fastify.decorate('redis', client)
}

export default Fp(redisClient)
