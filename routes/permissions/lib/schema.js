import S from 'fluent-json-schema'

export function sCreatePermission() {
  return S.object()
    .additionalProperties(false)
    .prop('resource', S.string())
    .description('Defines the resource referred to the permission.')
    .required()
    .prop('action', S.string())
    .description('Defienes the action that permitted to the resource.')
    .required()
    .prop('ownership', S.string().enum(['any', 'own']))
    .description('Permission ownership.')
    .prop('description', S.string().minLength(5).maxLength(200))
    .description('Permission description.')
    .required()
}

export function sPermissionResponse() {
  return S.object()
    .additionalProperties(false)
    .prop('id', S.string())
    .description('Permission id.')
    .required()
    .prop('resource', S.string())
    .description('Defines the resource referred to the permission.')
    .required()
    .prop('action', S.string())
    .description('Defienes the action that permitted to the resource.')
    .required()
    .prop('ownership', S.string().enum(['any', 'own']))
    .description('Permission ownership.')
    .prop('description', S.string().minLength(5).maxLength(200))
    .description('Permission description.')
    .required()
}
