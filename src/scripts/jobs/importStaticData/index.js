import massive from 'massive'

import { importGroups } from './importGroups.js'
import { importSenators } from './importSenators.js'
import { importDeputies } from './importDeputies.js'

async function importStaticData() {
  console.log('Start to import static data...')

  const db = await massive({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DB,
    password: process.env.PG_PW,
    port: process.env.PG_PORT,
  })

  await importGroups(db)
  await importSenators(db)
  await importDeputies(db)

  console.log('Import static data finished!')
}

importStaticData()
  .then(() => {
    process.exit()
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })

/**
 * Importazione gruppi
 * - siccome ce n'è n con lo stesso id e nome, ho preso solo l'ultimo
 *
 * Importazione senatori
 * - siccome c'è nè n con lo stesso id, preso solo quello già presente
 *
 * Importazione deputati
 * - non è possibile avere il partito per tutti
 */
