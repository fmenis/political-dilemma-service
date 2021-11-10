import redis from 'redis'
import Fp from 'fastify-plugin'

async function redisClient(fastify) {
  const client = redis.createClient({
    host: fastify.config.REDIS_HOST,
    port: fastify.config.REDIS_PORT
  })

  client.on('error', function (error) {
    fastify.log.error(error) //TODO capire se serve
  })

  function close() {
    return new Promise(resolve => {
      client.quit(res => {
        resolve(res)
      })
    })
  }

  function get(key) {
    return new Promise((resolve, reject) => {
      client.get(key, (err, reply) => {
        if (err) {
          return reject(err)
        }
        reply = JSON.parse(reply)
        resolve(reply)
      })
    })
  }

  function set(key, value, opts = {}) {
    return new Promise((resolve, reject) => {
      if (typeof value === 'object') {
        value = JSON.stringify(value)
      }

      const params = [key, value]

      if (opts.setOnlyIfExists) {
        params.push('NX')
      }

      if (opts.setOnlyIfNotExists) {
        params.push('XX')
      }

      if (opts.ttl) {
        params.push('EX', opts.ttl)
      }

      client.set(...params, (err, reply) => {
        if (err) {
          return reject(err)
        }
        resolve(reply)
      })
    })
  }

  function del(key) {
    return new Promise((resolve, reject) => {
      client.unlink(key, (err, value) => {
        if (err) {
          return reject(err)
        }
        resolve(value)
      })
    })
  }

  function setExpireTime(key, ttl) {
    return new Promise((resolve, reject) => {
      client.expire(key, ttl, (err, reply) => {
        if (err) {
          return reject(err)
        }
        resolve(reply)
      })
    })
  }

  fastify.decorate('redis', {
    close, get, set, del, setExpireTime
  })
}


export default Fp(redisClient)