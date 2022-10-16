import Postgrator from 'postgrator'
import pg from 'pg'
import { join, resolve } from 'path'

async function applyMigrations() {
  const client = new pg.Client({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    database: process.env.PG_DB,
    user: process.env.PG_USER,
    password: process.env.PG_PW,
  })

  const schema = 'public'

  try {
    await client.connect()

    const postgrator = new Postgrator({
      migrationPattern: join(resolve(), '/migrations/*'),
      driver: 'pg',
      database: process.env.PG_DB,
      schemaTable: 'migrations',
      currentSchema: schema,
      execQuery: query => client.query(query),
    })

    postgrator.on('migration-started', migration =>
      console.info(
        `Start to execute '${migration.name}' (${migration.action}) migration...`
      )
    )

    postgrator.on('migration-finished', migration =>
      console.info(
        `Migration '${migration.name}' (${migration.action}) successfully applied! \n`
      )
    )

    const results = await postgrator.migrate()

    if (results.length === 0) {
      console.info(
        `No migrations run for schema '${schema}'. Db '${process.env.PG_DB}' already at the latest version.`
      )
    } else {
      console.info(`${results.length} migration/s applited.`)
    }
  } catch (error) {
    if (error.appliedMigrations) {
      console.error(error.appliedMigrations)
    }
    throw new Error(error)
  }

  await client.end()
}

applyMigrations()
