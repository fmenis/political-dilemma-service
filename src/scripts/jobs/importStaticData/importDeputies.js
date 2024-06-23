import { readFile } from 'fs/promises'
import { join, resolve } from 'path'

import { POLITICIAN_TYPE } from '../../../routes/common/enums.js'
import { capitalizeString } from '../../../utils/main.js'

export async function importDeputies(db) {
  console.log(`Start 'import-deputies' job...`)

  const filePath = join(resolve(), 'src/scripts/jobs/data', 'deputies.json')
  const data = JSON.parse(await readFile(filePath, 'utf8'))

  for (const chunk of data.results.bindings) {
    const parsedRow = await parseRow(chunk, db)
    await persistRow(parsedRow, db)
  }

  console.log(`Finish 'import-deputies' job! `)
}

async function parseRow(row, db) {
  const externalId = parseInt(
    row.persona.value.split('.rdf/')[1].replace('p', '')
  )

  const groupName = parseGroupName(row.nomeGruppo.value)
  const group = (await db.group.where(`name ILIKE $1`, [groupName]))[0]

  const parsedRow = {
    externalId,
    groupId: group ? group.id : null,
    type: POLITICIAN_TYPE.DEPUTY,
    firstName: capitalizeString(row.nome.value),
    lastName: capitalizeString(row.cognome.value),
    gender: row.genere.value.toUpperCase(),
    birthDate: parseBirthDate(row.dataNascita.value),
    birthCity: capitalizeString(row.luogoNascita.value),
    img: row.img.value,
    link: row.persona.value,
  }

  return parsedRow
}

function parseBirthDate(birthDate) {
  const year = birthDate.slice(0, 4)
  const month = birthDate.slice(4, 6)
  const day = birthDate.slice(6, 8)

  return new Date(`${month}-${day}-${year}`)
}

function parseGroupName(value) {
  if (value.includes('-')) {
    value = value.split('-')[0]
  }

  if (value.includes('(')) {
    value = value.split('(')[0]
  }

  value = value.toLowerCase().trim()
  return value
}

async function persistRow(parsedRow, db) {
  try {
    await db.politician.save(parsedRow)
  } catch (error) {
    console.debug('Error during persisting row')
    throw error
  }
}

// SELECT DISTINCT ?persona ?cognome ?nome ?info
// ?dataNascita ?luogoNascita ?genere ?img
// ?collegio ?lista ?nomeGruppo ?gruppo COUNT(DISTINCT ?madatoCamera) as ?numeroMandati ?aggiornamento
// WHERE {
// ?persona ocd:rif_mandatoCamera ?mandato; a foaf:Person.

// ## deputato
// ?d a ocd:deputato;
// ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/repubblica_19>;
// ocd:rif_mandatoCamera ?mandato.
// OPTIONAL{?d ocd:aderisce ?aderisce}
// OPTIONAL{?d dc:description ?info}

// ##anagrafica
// ?d foaf:surname ?cognome; foaf:gender ?genere; foaf:depiction ?img; foaf:firstName ?nome.
// OPTIONAL{
// ?persona <http://purl.org/vocab/bio/0.1/Birth> ?nascita.
// ?nascita <http://purl.org/vocab/bio/0.1/date> ?dataNascita;
// rdfs:label ?nato; ocd:rif_luogo ?luogoNascitaUri.
// ?luogoNascitaUri dc:title ?luogoNascita.
// }

// ##aggiornamento del sistema
// OPTIONAL{?d <http://lod.xdams.org/ontologies/ods/modified> ?aggiornamento.}

// ## mandato
// ?mandato ocd:rif_elezione ?elezione.
// MINUS{?mandato ocd:endDate ?fineMandato.}

// ## totale mandati
// ?persona ocd:rif_mandatoCamera ?madatoCamera.

// ## elezione
// OPTIONAL {
// ?elezione dc:coverage ?collegio
// }
// OPTIONAL {
// ?elezione ocd:lista ?lista
// }

// ## adesione a gruppo
// OPTIONAL {?aderisce ocd:rif_gruppoParlamentare ?gruppo}
// OPTIONAL {?aderisce rdfs:label ?nomeGruppo}
// MINUS{?aderisce ocd:endDate ?fineAdesione}

// }
