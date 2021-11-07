import S from 'fluent-json-schema'

export function sNoContent() {
  return {
    $id: 'sNoContent',
    description: 'No content',
    type: 'null'
  }
}

export function sBadRequest() {
  return S.object()
    .id('sBadRequest')
    .additionalProperties(false)
    .description('Bad Request')
    .prop('statusCode', S.number())
    .description('Http status code')
    .default('400')
    .required()
    .prop('error', S.string())
    .description('Http error')
    .default('Bad Request')
    .required()
    .prop('message', S.string())
    .description('Message')
    .required()
}

export function sUnauthorized() {
  return S.object()
    .id('sUnauthorized')
    .additionalProperties(false)
    .description('Unauthorized')
    .prop('statusCode', S.number())
    .description('Http status code')
    .default('401')
    .required()
    .prop('error', S.string())
    .description('Http error')
    .default('Unauthorized')
    .required()
    .prop('message', S.string())
    .description('Message')
    .required()
}

export function sForbidden() {
  return S.object()
    .id('sForbidden')
    .additionalProperties(false)
    .description('Forbidden')
    .prop('statusCode', S.number())
    .description('Http status code')
    .default('403')
    .required()
    .prop('error', S.string())
    .description('Http error')
    .default('Forbidden')
    .required()
    .prop('message', S.string())
    .description('Message')
    .required()
}

export function sNotFound() {
  return S.object()
    .id('sNotFound')
    .additionalProperties(false)
    .description('Not found')
    .prop('statusCode', S.number())
    .description('Http status code')
    .default('404')
    .required()
    .prop('error', S.string())
    .description('Http error')
    .default('Not found')
    .required()
    .prop('message', S.string())
    .description('Message')
    .required()
}

export function sConflict() {
  return S.object()
    .id('sConflict')
    .additionalProperties(false)
    .description('Conflict')
    .prop('statusCode', S.number())
    .description('Http status code')
    .default('409')
    .required()
    .prop('error', S.string())
    .description('Http error')
    .default('Conflict')
    .required()
    .prop('message', S.string())
    .description('Message')
    .required()
}