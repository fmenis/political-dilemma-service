import S from 'fluent-json-schema'

export function sUserResponse() {
  return S.object()
    .additionalProperties(false)
    .description('User')
    .prop('id', S.number())
    .description('User id.')
    .required()
    .prop('firstName', S.string().minLength(1).maxLength(50))
    .description('User first name.')
    .required()
    .prop('lastName', S.string().minLength(1).maxLength(50))
    .required()
    .description('User last name.')
    .prop('userName', S.string().minLength(3).maxLength(50))
    .description('User system name. It must be unique.')
    .required()
    .prop('email', S.string().format('email').minLength(6).maxLength(50))
    .description('User email. It must be unique.')
    .required()
    .prop('bio', S.string().maxLength(500))
    .description('User biography.')
    .prop('birthDate', S.string().format('date'))
    .description('User birth date.')
    .prop('joinedDate', S.string().format('date-time'))
    .description('Defines when a user accepts the system invitation.')
    .prop('sex', S.string().enum(['male', 'female', 'other']))
    .description('User sex.')
    .prop('isBlocked', S.boolean())
    .description(
      `Defines if the user is blocked, i.e. 
      if he cannot use the API (until it is unblocked).`
    )
    .required()
    .prop('isDeleted', S.boolean())
    .description(`Defines if the user is deleted`)
    .required()
}

export function sCreateUser() {
  return S.object()
    .additionalProperties(false)
    .prop('firstName', S.string().minLength(1).maxLength(50))
    .description('User first name.')
    .required()
    .prop('lastName', S.string().minLength(1).maxLength(50))
    .description('User last name.')
    .required()
    .prop('userName', S.string().minLength(3).maxLength(50))
    .description('User system name. It must be unique.')
    .required()
    .prop('email', S.string().format('email').minLength(6).maxLength(50))
    .description('User email. It must be unique.')
    .required()
    .prop('confirmEmail', S.string().format('email').minLength(6).maxLength(50))
    .description('Email confirmation')
    .required()
    .prop(
      'password',
      S.string().pattern(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})(?=.*[!@#$%^&*])/g
      )
    )
    .description('User password.')
    .required()
    .prop(
      'confirmPassword',
      S.string().pattern(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})(?=.*[!@#$%^&*])/g
      )
    )
    .description('Password confirmation.')
    .required()
    .prop('bio', S.string().maxLength(500))
    .description('User biography.')
    .prop('birthDate', S.string().format('date'))
    .description('User birth date.')
    .prop('sex', S.string().enum(['male', 'female', 'other']))
    .description('User sex.')
}

export function sUpdateUser() {
  return S.object()
    .additionalProperties(false)
    .prop('firstName', S.string().minLength(1).maxLength(50))
    .description('User first name.')
    .required()
    .prop('lastName', S.string().minLength(1).maxLength(50))
    .description('User last name.')
    .required()
    .prop('userName', S.string().minLength(3).maxLength(50))
    .description('User system name. It must be unique.')
    .required()
    .prop('email', S.string().format('email').minLength(6).maxLength(50))
    .description('User email. It must be unique.')
    .required()
    .prop('bio', S.string().maxLength(500))
    .description('User biography.')
    .prop('birthDate', S.string().format('date'))
    .description('User birth date.')
    .prop('sex', S.string().enum(['male', 'female', 'other']))
    .description('User sex.')
    .prop('isBlocked', S.boolean())
    .description(
      `Defines if the user is blocked, i.e. 
      if he cannot use the API (until it is unblocked).`
    )
}
