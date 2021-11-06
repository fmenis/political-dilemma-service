import pg from 'pg'
import Fp from 'fastify-plugin'

async function postgresClient(fastify, opts) {
	const pool = new pg.Pool({
		user: fastify.config.PG_USER,
		host: fastify.config.PG_HOST,
		database: fastify.config.PG_DB,
		password: fastify.config.PG_PW,
		port: fastify.config.PG_PORT
	})

	pool.on('error', (err, client) => {
		fastify.log.error(err) //TODO capire se serve
	})

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

	fastify.decorate('db', {
		execQuery
	})
}

export default Fp(postgresClient)