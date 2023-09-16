import SparqlClient from 'sparql-http-client'
import massive from 'massive'

export async function importSenators(db) {
  console.log(`Start 'import-senators' job...`)

  let client

  try {
    client = new SparqlClient({ endpointUrl: process.env.SENATO_URL_DATA })
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

  const stream = await client.query.select(buildQuery())

  for await (const chunk of stream) {
    const parsedRow = parseRow(chunk)
    await persistRow(parsedRow, db)
  }

  console.log(`Finish 'import-senators' job! `)
}

function parseRow(row) {
  const groupExternalId = parseInt(row.gruppo.value.split('gruppo/')[1])
  const externalId = parseInt(row.senatore.value.split('senatore/')[1])

  const parsedRow = {
    externalId,
    groupExternalId,
    type: 'SENATOR', //##TODO enum
    firstName: row.nome.value,
    lastName: row.cognome.value,
    gender: row.gender === 'F' ? 'FEMALE' : 'MALE',
    birthDate: row.dataNascita.value,
    birthCity: capitalizeString(row.cittaNascita.value),
    img: row.img.value,
    link: row.senatore.value,
  }

  return parsedRow
}

function capitalizeString(str) {
  return str
    .split(' ')
    .map(item => {
      return `${item.charAt(0).toUpperCase()}${item.slice(1).toLowerCase()}`
    })
    .join(' ')
}

async function persistRow(parsedRow, db) {
  try {
    let group

    try {
      group = await db.group.findOne({
        externalId: parsedRow.groupExternalId,
      })
    } catch (error) {
      console.log(error)
    }

    const params = {
      externalId: parsedRow.externalId,
      type: 'SENATOR',
      firstName: parsedRow.firstName,
      lastName: parsedRow.lastName,
      gender: parsedRow.gender,
      birthDate: parsedRow.birthDate,
      birthCity: parsedRow.birthCity,
      img: parsedRow.img,
      link: parsedRow.link,
      groupId: group.id,
    }

    const res = await db.politician.save(params)
    console.log(res)
  } catch (error) {
    console.debug('Error during persisting row')
    throw error
  }
}

function buildQuery() {
  return `
    PREFIX ocd: <http://dati.camera.it/ocd/>
    PREFIX osr: <http://dati.senato.it/osr/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    
    SELECT DISTINCT ?gruppo ?nomeGruppo ?senatore ?nome ?cognome ?gender ?cittaNascita ?provinciaNascita ?dataNascita ?img ?carica ?inizioAdesione
    WHERE
    {
        ?gruppo a ocd:gruppoParlamentare .
        ?gruppo osr:denominazione ?denominazione .
        ?denominazione osr:titolo ?nomeGruppo .
        ?adesioneGruppo a ocd:adesioneGruppo .
        ?adesioneGruppo osr:carica ?carica .
        ?adesioneGruppo osr:inizio ?inizioAdesione.
        ?adesioneGruppo osr:gruppo ?gruppo.
        ?senatore ocd:aderisce ?adesioneGruppo.
        ?senatore a osr:Senatore.
        ?senatore foaf:firstName ?nome.
        ?senatore foaf:lastName ?cognome.
        ?senatore foaf:gender ?gender.
        ?senatore osr:cittaNascita ?cittaNascita.
        ?senatore osr:provinciaNascita ?provinciaNascita.
        ?senatore osr:dataNascita ?dataNascita.
        ?senatore foaf:depiction ?img.
        OPTIONAL { ?adesioneGruppo osr:fine ?fineAdesione }
        OPTIONAL { ?denominazione osr:fine ?fineDenominazione }
        FILTER(!bound(?fineAdesione) && !bound(?fineDenominazione) )
    }
    GROUP BY ?nomeGruppo
    ORDER BY ?nomeGruppo`
}

importSenators()
  .then(() => {
    process.exit(0)
  })
  .catch(err => {
    console.error(`Error during 'importPoliticians' job`, err)
    process.exit(1)
  })
