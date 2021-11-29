import pg from 'pg'
import Fp from 'fastify-plugin'

function postgresClient(fastify, options, done) {
  const pool = new pg.Pool({
    user: fastify.config.PG_USER,
    host: fastify.config.PG_HOST,
    database: fastify.config.PG_DB,
    password: fastify.config.PG_PW,
    port: fastify.config.PG_PORT,
  })

  pool.query('SELECT NOW()', err => {
    if (err) {
      return done(err)
    }
    fastify.log.debug('Postgres client correctly connetted')
    done()
  })

  pool.on('error', err => {
    fastify.log.error(err)
  })

  function execQuery(query, inputs = [], opts = {}) {
    return new Promise((resolve, reject) => {
      const client = opts.client || pool
      client.query(query, inputs, (err, reply) => {
        if (err) {
          return reject(err)
        }
        reply.rows = reply.rows.map(row => changeFieldsCase(row))
        if (opts.findOne) {
          return resolve(reply.rows[0])
        }
        resolve(reply)
      })
    })
  }

  function changeFieldsCase(obj) {
    return Object.keys(obj).reduce((acc, key) => {
      const camelCaseKey = key.split('_').reduce((str, item, index) => {
        if (index === 0) {
          str = item
        } else {
          str += `${item.charAt(0).toUpperCase()}${item.slice(1)}`
        }
        return str
      }, '')
      acc[camelCaseKey] = obj[key]
      return acc
    }, {})
  }

  fastify.decorate('db', {
    execQuery,
  })
}

export default Fp(postgresClient)
