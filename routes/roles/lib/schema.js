import S from 'fluent-json-schema'

import { sPermissionResponse } from '../../permissions/lib/schema.js'

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

export function sRoleResponse() {
  return S.object()
    .additionalProperties(false)
    .prop('id', S.number())
    .description('Role id')
    .required()
    .prop('name', S.string().minLength(3).maxLength(50))
    .description('Role name')
    .required()
    .prop('description', S.string().minLength(3).maxLength(200))
    .description('Role description')
    .required()
    .prop('permissions', S.array().items[sPermissionResponse()])
    .description('Role permissions ids list')
  // .required() TODO rimettere quando finita API lista
}
