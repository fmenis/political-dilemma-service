import S from 'fluent-json-schema'

export function sNoContent() {
  return {
    description: 'No content',
    type: 'null'
  }
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
    .description('Http message')
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
    .description('Http message')
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
    .description('Http message')
    .required()
}