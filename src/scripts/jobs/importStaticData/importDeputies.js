import SparqlClient from 'sparql-http-client'

import { POLITICIAN_TYPE } from '../../../routes/common/enums.js'

export async function importDeputies(db) {
  console.log(`Start 'import-deputies' job...`)

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
    // await persistRow(parsedRow, db)
  }

  console.log(`Finish 'import-deputies' job! `)
}

function parseRow(row) {
  // const groupExternalId = parseInt(row.gruppo.value.split('gruppo/')[1])
  const externalId = parseInt(row.persona.value.split('.rdf/')[1])

  const parsedRow = {
    externalId,
    // groupExternalId,
    type: POLITICIAN_TYPE.DEPUTY,
    firstName: capitalizeString(row.nome.value),
    lastName: capitalizeString(row.cognome.value),
    gender: row.gender.toUpperCase(),
    birthDate: row.dataNascita.value,
    birthCity: capitalizeString(row.luogoNascita.value),
    link: row.persona.value,
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

// function parseBirthDate(birthDate) {
//   const year = birthDate.slice(1, 4)
//   const day = birthDate.slice(1, 4)
//   const day = birthDate.slice(1, 4)
// }

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

    await db.politician.save(params)
  } catch (error) {
    console.debug('Error during persisting row')
    throw error
  }
}

function buildQuery() {
  return `
  PREFIX ocd: <http://dati.camera.it/ocd/>
  SELECT DISTINCT ?persona ?cognome ?nome 
  ?dataNascita  ?nato ?luogoNascita ?genere 
  ?collegio ?gruppo ?nomeGruppo ?sigla ?commissione ?aggiornamento  
  WHERE {
  ?persona ocd:rif_mandatoCamera ?mandato; a foaf:Person.
  
  ## deputato
  ?d a ocd:deputato; ocd:aderisce ?aderisce;
  ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/repubblica_19>;
  ocd:rif_mandatoCamera ?mandato.
  
  ##anagrafica
  ?d foaf:surname ?cognome; foaf:gender ?genere;foaf:firstName ?nome.
  OPTIONAL{
  ?persona <http://purl.org/vocab/bio/0.1/Birth> ?nascita.
  ?nascita <http://purl.org/vocab/bio/0.1/date> ?dataNascita; 
  rdfs:label ?nato; ocd:rif_luogo ?luogoNascitaUri. 
  ?luogoNascitaUri dc:title ?luogoNascita. 
  }
  
  ##aggiornamento del sistema
  OPTIONAL{?d <http://lod.xdams.org/ontologies/ods/modified> ?aggiornamento.}
  
  ## mandato
  ?mandato ocd:rif_elezione ?elezione.  
  MINUS{?mandato ocd:endDate ?fineMandato.}
  
  ## elezione
  ?elezione dc:coverage ?collegio.
  
  ## adesione a gruppo
  OPTIONAL{
    ?aderisce ocd:rif_gruppoParlamentare ?gruppo.
    ?gruppo <http://purl.org/dc/terms/alternative> ?sigla.
    ?gruppo dc:title ?nomeGruppo.
    ?gruppo dc:title ?gruppo.
  }
  
  MINUS{?aderisce ocd:endDate ?fineAdesione}
  
  ## organo
  OPTIONAL{
  ?d ocd:membro ?membro.?membro ocd:rif_organo ?organo. 
  ?organo dc:title ?commissione .
  }
  
  MINUS{?membro ocd:endDate ?fineMembership}
  }`
}

// importDeputies()
//   .then(() => {
//     process.exit(0)
//   })
//   .catch(err => {
//     console.error(`Error during 'importPoliticians' job`, err)
//     process.exit(1)
//   })
