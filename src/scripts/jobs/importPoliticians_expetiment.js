import { pipeline } from 'node:stream/promises'
import SparqlClient from 'sparql-http-client'
import massive from 'massive'
import { Transform, Writable } from 'fluido'

//##TODO fare env variable
const endpointUrl = 'https://dati.senato.it/sparql'

export async function importPoliticials(db) {
  console.log(`Start 'import-politicians' job...`)

  let client

  try {
    client = new SparqlClient({ endpointUrl })
  } catch (error) {
    console.error('Error during sparql client initialization')
    throw error
  }

  if (!db) {
    db = await massive({
      user: process.env.PG_USER,
      host: process.env.PG_HOST,
      database: process.env.PG_DB,
      password: process.env.PG_PW,
      port: process.env.PG_PORT,
    })
  }

  //##TODO validare risposta
  const stream = await makeRequest(client, buildQuery())
  // await pipeline(stream, parseRowTransform())

  await pipeline(
    makeRequest(client, buildQuery()),
    parseRowTransform(),
    persistRowWriteble()
  )

  /**
   * ##TODO
   * Studiare streams
   * Sarebbe bello implementare un transform stream che parsa la riga ed
   * un writable stream che la scrive a db
   */
  // for await (const chunk of stream) {
  //   const parsedRow = parseRow(chunk)
  //   await persistRow(parsedRow, db)
  // }

  console.log(`Finish 'import-politicians' job! `)
}

async function parseRowTransform() {
  return new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      const parsedChunk = parseRow(chunk)
      this.push(parsedChunk)
      callback()
    },
  })
}

function persistRowWriteble() {
  new Writable({
    objectMode: true,
    async write(parsedRow) {
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
    },
  })
}

async function makeRequest(client, query, acc = 0) {
  try {
    acc++
    console.log(`Attempt n° ${acc}`)
    const res = await client.query.select(query)
    console.log(`${acc}° attempt is fine!`)
    return res
  } catch (error) {
    console.log(`${acc}° attempt goes wrong!`)
    if (acc > 5) {
      throw new Error('TODO')
    }
    await sleep(500 * acc)
    await makeRequest(client, query, acc)
  }
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

function capitalizeString(str) {
  return str
    .split(' ')
    .map(item => {
      return `${item.charAt(0).toUpperCase()}${item.slice(1).toLowerCase()}`
    })
    .join(' ')
}

function parseRow(row) {
  const parsedRow = Object.entries(row).reduce((acc, item) => {
    const [key, value] = item
    if (['nome', 'cognome', 'cittaNascita'].includes(key)) {
      acc[key] = capitalizeString(value.value)
    } else {
      acc[key] = value.value
    }
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
