import S from 'fluent-json-schema'

export function sTags() {
  return S.array()
    .items(S.string().minLength(2).maxLength(30))
    .minItems(1)
    .maxItems(50)
}
