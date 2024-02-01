import SparqlClient from 'sparql-http-client'

import { POLITICIAN_TYPE } from '../../../routes/common/enums.js'
import { capitalizeString } from '../../../utils/main.js'

export async function importSenators(db) {
  console.log(`Start 'import-senators' job...`)

  let client

  try {
    client = new SparqlClient({ endpointUrl: process.env.SENATO_URL_DATA })
  } catch (error) {
    console.error('Error during sparql client initialization')
    throw error
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
    type: POLITICIAN_TYPE.SENATOR,
    firstName: row.nome.value,
    lastName: row.cognome.value,
    gender: row.gender.value === 'F' ? 'FEMALE' : 'MALE',
    birthDate: row.dataNascita.value,
    birthCity: capitalizeString(row.cittaNascita.value),
    img: row.img.value,
    link: row.senatore.value,
  }

  return parsedRow
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
      type: parsedRow.type,
      firstName: parsedRow.firstName,
      lastName: parsedRow.lastName,
      gender: parsedRow.gender,
      birthDate: parsedRow.birthDate,
      birthCity: parsedRow.birthCity,
      img: parsedRow.img,
      link: parsedRow.link,
      groupId: group.id,
    }

    const politician = await db.politician.findOne({
      externalId: parsedRow.externalId,
    })

    if (politician) {
      console.debug(
        `Skip ${politician.firstName} ${politician.lastName} (${politician.externalId}): already exists`
      )
      return
    }

    await db.politician.save(params)
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
      
      SELECT DISTINCT ?gruppo ?nomeGruppo ?senatore ?nome ?cognome ?gender ?img ?cittaNascita ?provinciaNascita ?dataNascita ?carica ?inizioAdesione ?fineAdesione
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
      ?senatore foaf:depiction ?img.
      ?senatore osr:cittaNascita ?cittaNascita.
      ?senatore osr:provinciaNascita ?provinciaNascita.
      ?senatore osr:dataNascita ?dataNascita.
      ?adesioneGruppo osr:legislatura ?legislatura.
      FILTER(?legislatura=19)
      OPTIONAL { ?adesioneGruppo osr:fine ?fineAdesione }
      OPTIONAL { ?denominazione osr:fine ?fineDenominazione }
      #FILTER(!bound(?fineAdesione) && !bound(?fineDenominazione) )
      }
      GROUP BY ?nomeGruppo
      ORDER BY ?nomeGruppo`
}
