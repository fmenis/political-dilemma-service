// eslint-disable-next-line node/no-unpublished-import
import massive from 'massive'

import { seedRegionsAndProvinces } from './seedRegionsAndProvinces.js'
import { seedUsers } from './seedUsers.js'
import { seedPermissions } from './seedPermissions.js'
import { seedRoles } from './seedRoles.js'

async function seedDb() {
  const db = await massive({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DB,
    password: process.env.PG_PW,
    port: process.env.PG_PORT,
  })

  try {
    await seedRegionsAndProvinces(db)
    await seedUsers(db)
    await seedPermissions(db)
    await seedRoles(db)

    console.log('Seeding completed!')
    db.instance.$pool.end()
  } catch (error) {
    console.error(error)
    // eslint-disable-next-line no-process-exit
    process.exit(1)
  }
}

seedDb()
