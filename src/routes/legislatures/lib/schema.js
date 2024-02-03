import S from 'fluent-json-schema'

export function sCreateLegislature() {
  return S.object()
    .additionalProperties(false)
    .prop('name', S.string().maxLength(10))
    .description('Legislature name.')
    .required()
    .prop('startDate', S.string().format('date'))
    .description('Legislature start date.')
    .prop('endDate', S.string().format('date'))
    .description('Legislature end date.')
}

export function sLegislatureDetail() {
  return S.object()
    .description('Legislature')
    .additionalProperties(false)
    .prop('id', S.string().format('uuid'))
    .description('Legislature id.')
    .required()
    .prop('name', S.string().maxLength(10))
    .description('Legislature name.')
    .required()
    .prop('startDate', S.string().format('date').raw({ nullable: true }))
    .description('Legislature start date.')
    .required()
    .prop('endDate', S.string().format('date').raw({ nullable: true }))
    .description('Legislature end date.')
    .required()
    .prop(
      'ministries',
      S.array().items(sMinistryDetail()).minItems(0).maxItems(50)
    )
    .description('Legislature ministries.')
    .required()
}

export function sMinistryDetail() {
  return S.object()
    .description('Ministry')
    .additionalProperties(false)
    .prop('id', S.string().format('uuid'))
    .description('Ministry id.')
    .required()
    .prop('name', S.string().maxLength(50))
    .description('Ministry name.')
    .required()
    .prop('ministerFullName', S.string().maxLength(100))
    .description('Minister name.')
    .required()
}
