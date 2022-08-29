import S from 'fluent-json-schema'

export function sUploadFileResponse() {
  return S.object()
    .additionalProperties(false)
    .description('Uploaded file/s.')
    .prop('id', S.string().format('uuid'))
    .description('File id.')
    .required()
    .prop('url', S.string().format('uri'))
    .description('File url.')
    .required()
    .prop('extension', S.string())
    .description('File extension.')
    .required()
    .prop('mimetype', S.string())
    .description('File mimetype.')
    .required()
    .prop('size', S.string())
    .description('File size.')
    .required()
}
