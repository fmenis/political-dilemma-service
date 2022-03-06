import S from 'fluent-json-schema'

import { sPermissionResponse } from '../../permissions/lib/schema.js'

export function sCreateRole() {
  return S.object()
    .additionalProperties(false)
    .prop('name', S.string().minLength(3).maxLength(50))
    .description('Role name.')
    .required()
    .prop('description', S.string().minLength(3).maxLength(200))
    .description('Role description.')
    .required()
    .prop('permissionsIds', S.array().items(S.number()).minItems(1))
    .description('Role permissions ids.')
    .required()
}

export function sRoleResponse() {
  return S.object()
    .additionalProperties(false)
    .prop('id', S.number().minimum(1))
    .description('Role id.')
    .required()
    .prop('name', S.string().minLength(3).maxLength(50))
    .description('Role name.')
    .required()
    .prop('description', S.string().minLength(3).maxLength(200))
    .description('Role description.')
    .required()
    .prop('isActive', S.boolean())
    .description('Defines if the role is active.')
    .required()
    .prop('permissions', S.array().items(sPermissionResponse()))
    .description('Role permissions ids.')
    .required()
}
