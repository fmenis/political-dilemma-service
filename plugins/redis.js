import redis from 'redis'
import Fp from 'fastify-plugin'

function redisClient(fastify, options, done) {
  const client = redis.createClient({
    host: fastify.config.REDIS_HOST,
    port: fastify.config.REDIS_PORT,
  })

  client.on('connect', () => {
    fastify.log.debug('Redis client correctly connetted')
    done()
  })

  client.on('error', err => {
    fastify.log.error(err)
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

  function getMulti(...keys) {
    return new Promise((resolve, reject) => {
      client.mget(...keys, (err, results) => {
        if (err) {
          return reject(err)
        }
        results = results.map(res => JSON.parse(res))
        return resolve(results)
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
        resolve(value === 1)
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

  function getKeys(pattern) {
    return new Promise((resolve, reject) => {
      pattern = pattern ? `*${pattern}*` : '*'
      client.keys(pattern, (err, keys) => {
        if (err) {
          return reject(err)
        }
        resolve(keys)
      })
    })
  }

  function exists(key) {
    return new Promise((resolve, reject) => {
      client.exists(key, (err, res) => {
        if (err) {
          return reject(err)
        }
        resolve(res === 1)
      })
    })
  }

  fastify.decorate('redis', {
    close,
    get,
    set,
    del,
    setExpireTime,
    getKeys,
    getMulti,
    exists,
  })
}

export default Fp(redisClient)
