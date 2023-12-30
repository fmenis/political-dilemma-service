import S from 'fluent-json-schema'

export function sGroupList() {
  return S.object()
    .additionalProperties(false)
    .prop('id', S.string().format('uuid'))
    .description('Group id.')
    .required()
    .prop('name', S.string().minLength(1).maxLength(50))
    .description('Group first name.')
    .required()
}
