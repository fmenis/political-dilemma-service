import S from 'fluent-json-schema'

export function sNoContent() {
  return {
    $id: 'sNoContent',
    description: 'No content',
    type: 'null',
  }
}

export function sAccepted() {
  return {
    $id: 'sAccepted',
    description: 'Accepted',
    type: 'null',
  }
}

export function sPaginatedInfo() {
  return S.object()
    .id('sPaginatedInfo')
    .additionalProperties(false)
    .prop('totalItems', S.integer())
    .description('Total results.')
    .required()
    .prop('itemsPerPage', S.integer())
    .description('Total results per page.')
    .required()
    .prop('pageCount', S.integer())
    .description('Total pages.')
    .required()
    .prop('page', S.integer())
    .description('Current page index.')
    .required()
    .prop('lastPage', S.boolean())
    .description('Defines if the current is the last available page.')
    .required()
}
