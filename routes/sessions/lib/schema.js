import S from 'fluent-json-schema'

export function sSession() {
  return S.object()
    .additionalProperties(false)
    .prop('id', S.string())
    .description('Session id.')
    .required()
    .prop('userId', S.number())
    .description('User id.')
    .required()
    .prop('email', S.string().format('email').minLength(6).maxLength(50))
    .description('User email.')
    .required()
    .prop('userAgent', S.string())
    .description('User agent')
    .required()
    .prop('createdAt', S.string().format('date-time'))
    .description('Session creation date.')
    .required()
    .prop('lastActive', S.string().format('date-time'))
    .description('Last API usage date.')
    .required()
    .prop('isValid', S.boolean())
    .description('Defines if the session is valid.')
    .required()
    .prop('isCurrent', S.boolean())
    .description('Defines if the session is the current.')
    .required()
}
