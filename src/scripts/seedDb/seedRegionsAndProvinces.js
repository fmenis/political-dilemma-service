const regionsAndProvicens = [
  {
    name: 'Marche',
    provinces: [
      { name: 'Ancona', code: 'AN' },
      { name: 'Ascoli Piceno', code: 'AP' },
      { name: 'Fermo', code: 'FM' },
      { name: 'Macerata', code: 'MC' },
      { name: 'Pesaro-Urbino', code: 'PU' },
    ],
  },
  {
    name: 'Abruzzo',
    provinces: [
      { name: `L'Aquila`, code: 'AQ' },
      { name: `Chieti`, code: 'CH' },
      { name: `Pescara`, code: 'PE' },
      { name: `Teramo`, code: 'TE' },
    ],
  },
  {
    name: 'Basilicata',
    provinces: [
      { name: `Matera`, code: 'MT' },
      { name: `Potenza`, code: 'PZ' },
    ],
  },
  {
    name: 'Molise',
    provinces: [
      { name: 'Campobasso', code: 'CB' },
      { name: 'Isernia', code: 'IS' },
    ],
  },
  {
    name: 'Trentino Alto Adige',
    provinces: [
      { name: 'Bolzano', code: 'BZ' },
      { name: 'Trento', code: 'TN' },
    ],
  },
  {
    name: 'Puglia',
    provinces: [
      { name: 'Bari', code: 'BA' },
      { name: 'Barletta-Andria-Trani', code: 'BT' },
      { name: 'Brindisi', code: 'BR' },
      { name: 'Foggia', code: 'FG' },
      { name: 'Lecce', code: 'LE' },
      { name: 'Taranto', code: 'TA' },
    ],
  },
  {
    name: 'Calabria',
    provinces: [
      { name: 'Catanzaro', code: 'CZ' },
      { name: 'Cosenza', code: 'CS' },
      { name: 'Crotone', code: 'KR' },
      { name: 'Reggio-Calabria', code: 'RC' },
      { name: 'Vibo-Valentia', code: 'VV' },
    ],
  },
  {
    name: 'Campania',
    provinces: [
      { name: 'Avellino', code: 'AV' },
      { name: 'Benevento', code: 'BN' },
      { name: 'Caserta', code: 'CE' },
      { name: 'Napoli', code: 'NA' },
      { name: 'Salerno', code: 'SA' },
    ],
  },
  {
    name: 'Lazio',
    provinces: [
      { name: 'Frosinone', code: 'FR' },
      { name: 'Latina', code: 'LT' },
      { name: 'Rieti', code: 'RI' },
      { name: 'Roma', code: 'RM' },
      { name: 'Viterbo', code: 'VT' },
    ],
  },
  {
    name: 'Sardegna',
    provinces: [
      { name: 'Cagliari', code: 'CA' },
      { name: 'Carbonia-Iglesias', code: 'CI' },
      { name: 'Medio Campidano', code: 'VS' },
      { name: 'Nuoro', code: 'NU' },
      { name: 'Ogliastra', code: 'OG' },
      { name: 'Olbia Tempio', code: 'OT' },
      { name: 'Sassari', code: 'SS' },
    ],
  },
  {
    name: 'Sicilia',
    provinces: [
      { name: 'Agrigento', code: 'AG' },
      { name: 'Caltanissetta', code: 'CL' },
      { name: 'Catania', code: 'CT' },
      { name: 'Enna', code: 'EN' },
      { name: 'Messina', code: 'ME' },
      { name: 'Palermo', code: 'PA' },
      { name: 'Ragusa', code: 'RG' },
      { name: 'Siracusa', code: 'SR' },
      { name: 'Trapani', code: 'TP' },
    ],
  },
  {
    name: 'Toscana',
    provinces: [
      { name: 'Arezzo', code: 'AR' },
      { name: 'Firenze', code: 'FI' },
      { name: 'Grosseto', code: 'GR' },
      { name: 'Livorno', code: 'LI' },
      { name: 'Lucca', code: 'LU' },
      { name: 'Massa-Carrara', code: 'MS' },
      { name: 'Pisa', code: 'PI' },
      { name: 'Pistoia', code: 'PT' },
      { name: 'Prato', code: 'PO' },
      { name: 'Siena', code: 'SI' },
    ],
  },
  {
    name: 'Piemonte',
    provinces: [
      { name: 'Alessandria', code: 'AL' },
      { name: 'Asti', code: 'AT' },
      { name: 'Biella', code: 'BI' },
      { name: 'Cuneo', code: 'CN' },
      { name: 'Novara', code: 'NO' },
      { name: 'Torino', code: 'TO' },
      { name: 'Verbania', code: 'VB' },
      { name: 'Vercelli', code: 'VC' },
    ],
  },
  {
    name: 'Emilia Romagna',
    provinces: [
      { name: 'Bologna', code: 'BO' },
      { name: 'Ferrara', code: 'FE' },
      { name: 'Forlì-Cesena', code: 'FC' },
      { name: 'Modena', code: 'MO' },
      { name: 'Parma', code: 'PR' },
      { name: 'Piacenza', code: 'PC' },
      { name: 'Ravenna', code: 'RA' },
      { name: 'Reggio-Emilia', code: 'RE' },
      { name: 'Rimini', code: 'RN' },
    ],
  },
  {
    name: 'Friuli Venezia Giulia',
    provinces: [
      { name: 'Gorizia', code: 'GO' },
      { name: 'Udine', code: 'UD' },
      { name: 'Pordenone', code: 'PN' },
      { name: 'Trieste', code: 'TS' },
    ],
  },
  {
    name: `Valle d'Aosta`,
    provinces: [{ name: 'Aosta', code: 'AO' }],
  },
  {
    name: 'Veneto',
    provinces: [
      { name: 'Belluno', code: 'BL' },
      { name: 'Padova', code: 'PD' },
      { name: 'Rovigo', code: 'RO' },
      { name: 'Treviso', code: 'TV' },
      { name: 'Venezia', code: 'VE' },
      { name: 'Verona', code: 'VR' },
      { name: 'Vicenza', code: 'VI' },
    ],
  },
  {
    name: 'Liguria',
    provinces: [
      { name: 'Genova', code: 'GE' },
      { name: 'Imperia', code: 'IM' },
      { name: 'La Spezia', code: 'SP' },
      { name: 'Savona', code: 'SV' },
    ],
  },
  {
    name: 'Lombardia',
    provinces: [
      { name: 'Bergamo', code: 'BG' },
      { name: 'Brescia', code: 'BS' },
      { name: 'Como', code: 'CO' },
      { name: 'Cremona', code: 'CR' },
      { name: 'Lecco', code: 'LC' },
      { name: 'Lodi', code: 'LO' },
      { name: 'Mantova', code: 'MN' },
      { name: 'Milano', code: 'MI' },
      { name: 'Monza-Brianza', code: 'MB' },
      { name: 'Sondrio', code: 'SO' },
      { name: 'Varese', code: 'VA' },
    ],
  },
  {
    name: 'Umbria',
    provinces: [
      { name: 'Perugia', code: 'PG' },
      { name: 'Terni', code: 'TR' },
    ],
  },
]

export async function seedRegionsAndProvinces(client) {
  for (const region of regionsAndProvicens) {
    const newRegion = await client.regions.save({ name: region.name })

    for (const province of region.provinces) {
      const { name, code } = province
      await client.provinces.save({ name, code, id_region: newRegion.id })
    }
  }
}
