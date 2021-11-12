import S from 'fluent-json-schema'

export function sUserResponse() {
  // TODO controllare utilità S.anyOf[null]
  return S.object()
    .additionalProperties(false)
    .description('User')
    .prop('id', S.number())
    .description('User id.')
    .required()
    .prop(
      'firstName',
      S.anyOf[(S.string().minLength(3).maxLength(50), S.null())]
    )
    .description('User first name.')
    .prop(
      'lastName',
      S.anyOf[(S.string().minLength(3).maxLength(50), S.null())]
    )
    .description('User last name.')
    .prop('userName', S.string().minLength(3).maxLength(50))
    .description('User system name. It must be unique.')
    .required()
    .prop('email', S.string().format('email').minLength(6).maxLength(50))
    .description('User email. It must be unique.')
    .required()
    .prop('bio', S.oneOf[(S.string().maxLength(500), S.null())])
    .description('User biography.')
    .prop('isBlocked', S.boolean())
    .description(
      `Define if the user is blocked, i.e. 
      if he cannot use the API (until it is unblocked).`
    )
    .prop('createdAt', S.string().format('date-time'))
    .description('Defines when the user was created.')
    .prop('updatedAt', S.string().format('date-time'))
    .description('Defines the last time that the user was updated.')
}

export function sCreateUser() {
  return S.object()
    .additionalProperties(false)
    .prop('firstName', S.string().minLength(3).maxLength(50))
    .description('User first name.')
    .prop(
      'lastName',
      S.anyOf[(S.string().minLength(3).maxLength(50), S.null())]
    )
    .description('User last name.')
    .prop('userName', S.string().minLength(3).maxLength(50))
    .description('User system name. It must be unique.')
    .required()
    .prop('email', S.string().format('email').minLength(6).maxLength(50))
    .description('User email. It must be unique.')
    .required()
    .prop('password', S.string().minLength(8))
    .description('User password.')
    .required()
    .prop('confirmPassword', S.string().minLength(8))
    .description('Password confirmation.')
    .required()
    .prop('bio', S.string().maxLength(500))
    .description('User biography.')
    .prop('isBlocked', S.boolean())
    .description(
      `Define if the user is blocked, i.e.
      if he cannot use the API (until it is unblocked).`
    )
}

export function sUpdateUser() {
  return S.object()
    .additionalProperties(false)
    .prop('firstName', S.string().minLength(3).maxLength(50))
    .description('User first name.')
    .prop(
      'last_name',
      S.anyOf[(S.string().minLength(3).maxLength(50), S.null())]
    )
    .description('User last name.')
    .prop('userName', S.string().minLength(3).maxLength(50))
    .description('User system name. It must be unique.')
    .prop('email', S.string().format('email').minLength(6).maxLength(50))
    .description('User email. It must be unique.')
    .prop('bio', S.string().maxLength(500))
    .description('User biography.')
    .prop('isBlocked', S.boolean())
    .description(
      `Define if the user is blocked, i.e. 
      if he cannot use the API (until it is unblocked).`
    )
}
