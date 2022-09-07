import pg from 'pg'

async function feedDb() {
  const client = new pg.Client({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    database: process.env.PG_DB,
    user: process.env.PG_USER,
    password: process.env.PG_PW,
  })

  try {
    //TODO lanciare, sotto transazione tutti gli script di seed
  } catch (error) {
    console.error(error)
  }

  await client.end()
}

feedDb()
