import S from 'fluent-json-schema'

export function sCreateLegislature() {
  return S.object()
    .additionalProperties(false)
    .prop('name', S.string().maxLength(50))
    .description('Legislature name.')
    .required()
    .prop('startDate', S.string().format('date'))
    .description('Legislature start date.')
    .prop('endDate', S.string().format('date'))
    .description('Legislature end date.')
}

export function sLegislatureList() {
  return S.object()
    .description('Legislature')
    .additionalProperties(false)
    .prop('id', S.string().format('uuid'))
    .description('Legislature id.')
    .required()
    .prop('name', S.string().maxLength(50))
    .description('Legislature name.')
    .required()
    .prop('startDate', S.string().format('date').raw({ nullable: true }))
    .description('Legislature start date.')
    .required()
    .prop('endDate', S.string().format('date').raw({ nullable: true }))
    .description('Legislature end date.')
    .required()
}

export function sLegislatureDetail() {
  return S.object()
    .description('Legislature')
    .additionalProperties(false)
    .prop(
      'ministries',
      S.array().items(sMinisterDetail()).minItems(0).maxItems(50)
    )
    .description('Legislature ministries.')
    .required()
    .extend(sLegislatureList())
}

function sMinisterDetail() {
  return S.object()
    .description('Minister')
    .additionalProperties(false)
    .prop('id', S.string().format('uuid'))
    .description('Minister id.')
    .required()
    .prop('name', S.string().maxLength(50))
    .description('Minister name.')
    .required()
    .prop(
      'ministry',
      S.object()
        .additionalProperties(false)
        .prop('id', S.string().format('uuid'))
        .description('Ministry id.')
        .required()
        .prop('firstName', S.string().maxLength(50))
        .description('Ministry first name')
        .required()
        .prop('lastName', S.string().maxLength(50))
        .description('Ministry last name')
        .required()
    )
    .description('Ministry info')
    .required()
}

export function sUpdateLegislature() {
  return S.object()
    .additionalProperties(false)
    .prop('name', S.string().maxLength(50))
    .description('Legislature name.')
    .prop('startDate', S.string().format('date'))
    .description('Legislature start date.')
    .prop('endDate', S.string().format('date'))
    .description('Legislature end date.')
}

export function sAddMinistries() {
  return S.object()
    .additionalProperties(false)
    .prop(
      'ministries',
      S.array()
        .items(
          S.object()
            .additionalProperties(false)
            .prop('name', S.string().minLength(2).maxLength(50))
            .description('Ministry name.')
            .required()
            .prop('politicianId', S.string().format('uuid'))
            .description('Politician id.')
            .required()
        )
        .minItems(1)
        .maxItems(50)
    )
    .required()
}
