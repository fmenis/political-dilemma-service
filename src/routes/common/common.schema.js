import S from 'fluent-json-schema'

import { getFileTargets } from './enums.js'

export function sTags() {
  return S.array()
    .items(S.string().minLength(2).maxLength(30))
    .minItems(1)
    .maxItems(50)
    .uniqueItems(true)
}

export function sAttachmet() {
  return S.object()
    .additionalProperties(false)
    .prop('id', S.string().format('uuid'))
    .description('File id.')
    .required()
    .prop('url', S.string().format('uri'))
    .description('File url.')
    .required()
    .prop('target', S.string().enum(getFileTargets()))
    .description('Indicates the section where the file is involved.')
    .required()
}
