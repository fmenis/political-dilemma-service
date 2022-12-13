import redis from 'redis'
import Fp from 'fastify-plugin'

async function redisClient(fastify) {
  const { log } = fastify

  const client = redis.createClient({
    host: fastify.config.REDIS_HOST,
    port: fastify.config.REDIS_PORT,
  })

  await client.connect()

  log.debug('Redis client correctly connected')

  client.on('error', err => {
    log.error(err)
  })

  fastify.decorate('redis', client)
}

export default Fp(redisClient)
