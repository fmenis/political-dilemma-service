import S from 'fluent-json-schema'

export function sCreateRole() {
  return S.object()
    .additionalProperties(false)
    .prop('name', S.string().minLength(3).maxLength(50))
    .description('Role name')
    .required()
    .prop('description', S.string().minLength(3).maxLength(200))
    .description('Role description')
    .required()
    .prop('permissionsIds', S.array().items([S.number()]).maxItems(50))
    .description('Role permissions ids list')
    .required()
}
