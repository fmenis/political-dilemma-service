const ACTIVITY_TYPES = {
  DECRETO_LEGGE: 'DECRETO_LEGGE',
  DECRETO_MINISTERIALE: 'DECRETO_MINISTERIALE',
  LEGGE_ORDINARIA: 'LEGGE_ORDINARIA',
  DECRETO_DEL_PRESIDENTE_DEL_CONSIGLIO_DEI_MINISTRI:
    'DECRETO_DEL_PRESIDENTE_DEL_CONSIGLIO_DEI_MINISTRI',
}

const ACTIVITY_SHORT_TYPES = {
  DL: 'DL',
  DM: 'DECRETO_MINISTERIALE',
  I: 'I',
  DPCM: 'DPCM',
}

const COMBINED_TYPES = {
  DECRETO_LEGGE: 'DL',
  DECRETO_MINISTERIALE: 'DM',
  LEGGE_ORDINARIA: 'I',
  DECRETO_DEL_PRESIDENTE_DEL_CONSIGLIO_DEI_MINISTRI: 'DPCM',
}

export { ACTIVITY_TYPES, ACTIVITY_SHORT_TYPES, COMBINED_TYPES }
