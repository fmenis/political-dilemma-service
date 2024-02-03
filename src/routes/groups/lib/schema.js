import S from 'fluent-json-schema'

export function sGroupDetail() {
  return S.object()
    .additionalProperties(false)
    .prop('id', S.string().format('uuid'))
    .description('Group id.')
    .required()
    .prop('name', S.string().minLength(1).maxLength(50))
    .description('Group first name.')
    .required()
    .prop(
      'initials',
      S.string().minLength(2).maxLength(15).raw({ nullable: true })
    )
    .description('Group initials.')
    .required()
    .prop('color', S.string().minLength(6).maxLength(6).raw({ nullable: true }))
    .description('Group color.')
    .required()
    .prop(
      'orientation',
      S.string().minLength(3).maxLength(50).raw({ nullable: true })
    )
    .description('Group orientation.')
    .required()
}

export function sUpdateGroup() {
  return S.object()
    .prop('initials', S.string().minLength(2).maxLength(15))
    .description('Group initials.')
    .prop('color', S.string().minLength(6).maxLength(6))
    .description('Group color.')
    .prop('orientation', S.string().minLength(3).maxLength(50))
}
