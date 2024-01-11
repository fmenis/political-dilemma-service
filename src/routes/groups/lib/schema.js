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
    .prop(
      'intials',
      S.string().minLength(2).maxLength(15).raw({ nullable: true })
    )
    .description('Group initials.')
    .required()
    .prop('color', S.string().maxLength(6).raw({ nullable: true }))
    .description('Group initials.')
    .required()
    .prop(
      'orientation',
      S.string().minLength(3).maxLength(50).raw({ nullable: true })
    )
    .description('Group initials.')
    .required()
}
