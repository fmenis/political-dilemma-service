import S from 'fluent-json-schema'

export function sInternalNote() {
  return S.object()
    .description('Intenal note.')
    .additionalProperties(false)
    .prop('id', S.string().format('uuid'))
    .description('Internal note id.')
    .required()
    .prop('text', S.string().minLength(3).maxLength(250))
    .description('Internal note text.')
    .required()
    .prop(
      'category',
      S.string().minLength(3).maxLength(50).enum(['articles', 'activities'])
    )
    .description('Internal note category.')
    .required()
    .prop('ownerId', S.string().format('uuid'))
    .description('Article owner id.')
    .required()
    .prop('relatedDocumentId', S.string().format('uuid'))
    .description('Article related document id.')
    .required()
    .prop('createdAt', S.string().format('date-time'))
    .description('Article creation date.')
    .required()
}
