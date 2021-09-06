import Fp from 'fastify-plugin'
import massive from 'massive'

async function postgres(fastify, opts) {
  const db = await massive({
		user: process.env.PG_USER,
		host: process.env.PG_HOST,
		database: process.env.PG_DB,
		password: process.env.PG_PW,
		port: process.env.PG_PORT
	});

  fastify.log.debug('Postgres client initialized!')

  fastify.decorate('pg', db)
}

export default Fp(postgres)