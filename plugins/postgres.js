import pg from 'pg'
import Fp from 'fastify-plugin'

async function postgresClient(fastify) {
  const pool = new pg.Pool({
    user: fastify.config.PG_USER,
    host: fastify.config.PG_HOST,
    database: fastify.config.PG_DB,
    password: fastify.config.PG_PW,
    port: fastify.config.PG_PORT
  })

  //TODO capire se serve
  // pool.on('error', (err, client) => {
  //   fastify.log.error(err)
  // })

  function execQuery(query, inputs = [], client = pool) {
    return new Promise((resolve, reject) => {
      client.query(query, inputs, (err, reply) => {
        if (err) {
          return reject(err)
        }
        resolve(reply)
      })
    })
  }

  async function findOne(query, inputs) {
    const reply = await execQuery(query, inputs)
    return reply.rows[0]
  }

  fastify.decorate('db', {
    execQuery, findOne
  })
}

export default Fp(postgresClient)