import S from 'fluent-json-schema'

export function sBadRequest() {
  return S.object()
    .id('sBadRequest')
    .additionalProperties(false)
    .description('Bad Request.')
    .prop('statusCode', S.integer())
    .description('Http status code.')
    .default('400')
    .required()
    .prop('error', S.string())
    .description('Http error.')
    .default('Bad Request')
    .required()
    .prop('message', S.string())
    .description('Message.')
    .required()
    .prop('internalCode', S.string())
    .description('Internal code.\n' + '0000: no specific error code.')
    .required()
    .prop(
      'details',
      S.object()
        .additionalProperties(true)
        .prop(
          'validation',
          S.array().items(
            S.object()
              .additionalProperties(true)
              .prop('message', S.string())
              .description('Validation message.')
              .required()
          )
        )
    )
    .description('Error details (unstructured data).')
    .required()
}

export function sUnauthorized() {
  return S.object()
    .id('sUnauthorized')
    .additionalProperties(false)
    .description('Unauthorized.')
    .prop('statusCode', S.integer())
    .description('Http status code.')
    .default('401')
    .required()
    .prop('error', S.string())
    .description('Http error.')
    .default('Unauthorized')
    .required()
    .prop('message', S.string())
    .description('Message.')
    .required()
    .prop('internalCode', S.string())
    .description(
      'Internal code.\n' +
        '0001: invalid access, invalid credentials.\n' +
        '0004: invalid access, cookie not found (not present or expired).\n' +
        '0005: invalid access, malformed cookie.\n' +
        '0006: invalid access, session not found.\n' +
        '0011: invalid access, session expired.\n'
    )
    .required()
    .prop('details', S.object().additionalProperties(true))
    .description('Error details (unstructured data).')
    .required()
}

export function sForbidden() {
  return S.object()
    .id('sForbidden')
    .additionalProperties(false)
    .description('Forbidden.')
    .prop('statusCode', S.integer())
    .description('Http status code.')
    .default('403')
    .required()
    .prop('error', S.string())
    .description('Http error.')
    .default('Forbidden')
    .required()
    .prop('message', S.string())
    .description('Message.')
    .required()
    .prop('internalCode', S.string())
    .description(
      'Internal code.\n' +
        '0002: invalid access, user blocked by an administrator.\n' +
        '0003: invalid access, max session number reached.\n' +
        '0007: invalid access, session not valid.\n' +
        '0008: invalid access, user not found.\n' +
        '0009: invalid access, user deleted. \n' +
        '0010: invalid access, missing permission. \n' +
        '0012: forbidden, reset link not found. \n' +
        '0013: forbidden, reset link already used. \n' +
        '0014: forbidden, reset link expired. \n'
    )
    .required()
    .prop('details', S.object().additionalProperties(true))
    .description('Error details (unstructured data).')
    .required()
}

export function sNotFound() {
  return S.object()
    .id('sNotFound')
    .additionalProperties(false)
    .description('Not found.')
    .prop('statusCode', S.integer())
    .description('Http status code.')
    .default('404')
    .required()
    .prop('error', S.string())
    .description('Http error.')
    .default('Not found')
    .required()
    .prop('message', S.string())
    .description('Message.')
    .required()
    .prop('internalCode', S.string())
    .description('Internal code.')
    .enum(['0000: no specific error code'])
    .required()
    .prop('details', S.object().additionalProperties(true))
    .description('Error details (unstructured data).')
    .required()
}

export function sConflict() {
  return S.object()
    .id('sConflict')
    .additionalProperties(false)
    .description('Conflict.')
    .prop('statusCode', S.integer())
    .description('Http status code.')
    .default('409')
    .required()
    .prop('error', S.string())
    .description('Http error.')
    .default('Conflict')
    .required()
    .prop('message', S.string())
    .description('Message.')
    .required()
    .prop('internalCode', S.string())
    .description('Internal code.\n' + '0000: no specific error code.')
    .required()
    .prop('details', S.object().additionalProperties(true))
    .description('Error details (unstructured data).')
    .required()
}

export function sInternalServerError() {
  return S.object()
    .id('sInternalServerError')
    .additionalProperties(false)
    .description('Intenal Server Error.')
    .prop('statusCode', S.integer())
    .description('Http status code.')
    .default('500')
    .required()
    .prop('error', S.string())
    .description('Http error.')
    .default('Something went wrong')
    .required()
    .prop('message', S.string())
    .description('Message.')
    .required()
    .prop('internalCode', S.string())
    .description('Internal code.\n' + '0000: no specific error code.')
    .required()
    .prop('details', S.object().additionalProperties(true))
    .description('Error details (unstructured data).')
    .required()
}
