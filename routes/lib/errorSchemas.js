import S from 'fluent-json-schema'

export function sNoContent() {
  return {
    description: 'No content',
    type: 'null'
  }
}

export function sBadRequest() {
  return S.object()
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