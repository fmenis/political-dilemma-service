import SparqlClient from 'sparql-http-client'

export async function importGroups(db) {
  console.log(`Start 'import-groups' job...`)

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

  console.log(`Finish 'import-groups' job! `)
}

function parseRow(row) {
  const externalId = parseInt(row.gruppo.value.split('gruppo/')[1])

  const parsedRow = {
    externalId: externalId,
    name: row.nomeGruppo.value,
    startDate: row.inizio.value,
  }

  return parsedRow
}

async function persistRow(parsedRow, db) {
  try {
    const params = {
      externalId: parsedRow.externalId,
      name: parsedRow.name,
      startDate: parsedRow.startDate,
    }

    const group = await db.group.findOne({ externalId: params.externalId })

    if (!group) {
      return db.group.save(params)
    }

    if (
      new Date(params.startDate).toISOString() > group.startDate.toISOString()
    ) {
      await db.group.update(group.id, params)
    }
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
    
    SELECT DISTINCT ?gruppo ?nomeGruppo ?inizio
    WHERE
    {
        ?gruppo a ocd:gruppoParlamentare .
        ?gruppo osr:denominazione ?denominazione.
        ?denominazione osr:titolo ?nomeGruppo.
        ?denominazione osr:inizio ?inizio.
        
    }
    ORDER BY ?nomeGruppo`
}
