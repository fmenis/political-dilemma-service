// import { pipeline } from 'node:stream/promises'
import SparqlClient from 'sparql-http-client'
import massive from 'massive'

//##TODO fare env variable
const endpointUrl = 'https://dati.senato.it/sparql'

export async function importPoliticials(db) {
  console.log(`Start 'import-politicians' job...`)

  const client = new SparqlClient({ endpointUrl })

  if (!db) {
    db = await massive({
      user: process.env.PG_USER,
      host: process.env.PG_HOST,
      database: process.env.PG_DB,
      password: process.env.PG_PW,
      port: process.env.PG_PORT,
    })
  }

  const stream = await client.query.select(buildQuery())

  /**
   * ##TODO
   * Studiare streams
   * Sarebbe bello implementare un transform stream che parsa la riga ed
   * un writable stream che la scrive a db
   */
  for await (const chunk of stream) {
    const parsedRow = parseRow(chunk)
    await persistRow(parsedRow, db)
  }

  console.log(`Finish 'import-politicians' job! `)
}

function parseRow(row) {
  //##TODO algoritmo per avere tutti i nomi con prima lettera maiuiscola ed il resto minuscolo
  const parsedRow = Object.entries(row).reduce((acc, item) => {
    const [key, value] = item
    acc[key] = value.value
    return acc
  }, {})

  return parsedRow
}

async function persistRow(parsedRow, db) {
  try {
    const externalId = getExternalId(parsedRow)

    const params = {
      firstName: parsedRow.nome,
      lastName: parsedRow.cognome,
      gender: parsedRow.gender === 'F' ? 'FEMALE' : 'MALE',
      birthDate: parsedRow.dataNascita,
      birthCity: parsedRow.cittaNascita,
      img: parsedRow.depiction,
      link: parsedRow.senatore,
    }

    const politician = await db.politician.findOne({ externalId })

    if (politician) {
      await db.politician.update(
        { externalId },
        { ...params, updatedAt: new Date() }
      )
    } else {
      await db.politician.save({ ...params, externalId })
    }
  } catch (error) {
    console.error(error)
  }
}

function buildQuery() {
  return `
    PREFIX osr: <http://dati.senato.it/osr/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    
    SELECT DISTINCT ?senatore ?nome ?cognome ?inizioMandato ?legislatura ?gender ?cittaNascita ?dataNascita ?depiction
    WHERE {
        ?senatore a osr:Senatore.
        ?senatore foaf:firstName ?nome.
        ?senatore foaf:lastName ?cognome.
        ?senatore osr:mandato ?mandato.
        ?mandato osr:legislatura ?legislatura.
        ?mandato osr:inizio ?inizioMandato.
        ?senatore foaf:gender ?gender.
        ?senatore osr:cittaNascita ?cittaNascita.
        ?senatore osr:dataNascita ?dataNascita.
        ?senatore foaf:depiction ?depiction
        OPTIONAL { ?mandato osr:fine ?df. }
        FILTER(!bound(?df))
    } ORDER BY ?cognome ?nome`
}

function getExternalId(parsedRow) {
  const string = parsedRow.senatore
  const externalId = parseInt(string.split('senatore/')[1])
  return externalId
}

importPoliticials()
  .then(() => {
    // return 'COMPLETED'
    //##TODO ovviamente va bene solo se è uno script a mano, sennà pianta tutto il server
    process.exit(0)
  })
  .catch(err => {
    console.error(`Error during 'importPoliticians' job`, err)
    process.exit(1)
  })
