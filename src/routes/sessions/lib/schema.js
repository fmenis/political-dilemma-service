import S from 'fluent-json-schema'

export function sSession() {
  return S.object()
    .additionalProperties(false)
    .prop('id', S.string().format('uuid'))
    .description('Session id.')
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
    .prop('isCurrent', S.boolean())
    .description('Defines if the session is the current.')
    .required()
}
