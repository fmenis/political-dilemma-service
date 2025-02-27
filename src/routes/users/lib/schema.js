import S from 'fluent-json-schema'

function sUser() {
  return S.object()
    .additionalProperties(false)
    .description('User.')
    .prop('id', S.string().format('uuid'))
    .description('User id.')
    .required()
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
    .prop('regionId', S.string().format('uuid'))
    .description('User region id.')
    .required()
    .prop('provinceId', S.string().format('uuid'))
    .description('User province id.')
    .required()
    .prop('bio', S.string().maxLength(500).raw({ nullable: true }))
    .description('User biography.')
    .required()
    .prop('birthDate', S.string().format('date').raw({ nullable: true }))
    .description('User birth date.')
    .required()
    .prop('joinedDate', S.string().format('date-time').raw({ nullable: true }))
    .description('Defines when a user accepts the system invitation.')
    .required()
    .prop(
      'sex',
      S.string().enum(['male', 'female', 'other']).raw({ nullable: true })
    )
    .description('User sex.')
    .required()
    .prop('lastAccess', S.string().format('date-time').raw({ nullable: true }))
    .description(`Last user authentication date.`)
    .required()
    .prop('isBlocked', S.boolean())
    .description(
      `Defines if the user is blocked, i.e. 
      if he cannot use the API (until it is unblocked).`
    )
    .required()
    .prop('isDeleted', S.boolean())
    .description(`Defines if the user is deleted.`)
    .required()
}

export function sUserAccount() {
  return S.object()
    .prop('role', S.string())
    .description('User role.')
    .required()
    .extend(sUser())
}

export function sUserDetail() {
  return S.object()
    .prop('roleId', S.string().format('uuid'))
    .description('User role id.')
    .required()
    .extend(sUser())
}

export function sUserList() {
  return S.object()
    .additionalProperties(false)
    .description('User.')
    .prop('id', S.string().format('uuid'))
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
    .prop('joinedDate', S.string().format('date-time').raw({ nullable: true }))
    .description('Defines when a user accepts the system invitation.')
    .required()
    .prop('isBlocked', S.boolean())
    .description(
      `Defines if the user is blocked, i.e. 
      if he cannot use the API (until it is unblocked).`
    )
    .required()
    .prop('isDeleted', S.boolean())
    .description(`Defines if the user is deleted.`)
    .required()
    .prop('role', S.string().minLength(2))
    .description(`User roles`)
    .required()
    .prop('lastAccess', S.string().format('date-time').raw({ nullable: true }))
    .description(`Last user authentication date.`)
    .required()
    .prop('region', S.string().minLength(3))
    .description(`User region.`)
    .required()
    .prop('province', S.string().minLength(3))
    .description(`User province.`)
    .required()
    .prop('draftArticles', S.integer())
    .description(`Number of articles created by the user.`)
    .required()
    .prop('publishedArticles', S.integer())
    .description(`Number of articles published by the user.`)
    .required()
    .prop('draftActivities', S.integer())
    .description(`Number of activities created by the user.`)
    .required()
    .prop('publishedActivities', S.integer())
    .description(`Number of activities published by the user.`)
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
    .prop('type', S.string().enum(['backoffice', 'site']))
    .description('User type.')
    .required()
    .prop('confirmEmail', S.string().format('email').minLength(6).maxLength(50))
    .description('Email confirmation.')
    .required()
    .prop(
      'password',
      S.string().pattern(
        // eslint-disable-next-line max-len
        /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})(?=.*[;:_,.\-ç°§òàù@#é*è+[\]{}|!"£$%&/()=?^\\'ì<>])/g
      )
    )
    .description('User password.')
    .required()
    .prop(
      'confirmPassword',
      S.string().pattern(
        // eslint-disable-next-line max-len
        /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})(?=.*[;:_,.\-ç°§òàù@#é*è+[\]{}|!"£$%&/()=?^\\'ì<>])/g
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
    .prop('regionId', S.string().format('uuid'))
    .description('User region id.')
    .required()
    .prop('provinceId', S.string().format('uuid'))
    .description('User province id.')
    .required()
    .prop('rolesIds', S.array().items(S.string().format('uuid')).minItems(1))
    .description('User roles ids')
    .required()
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
    .prop('regionId', S.string().format('uuid'))
    .description('User region reference.')
    .required()
    .prop('provinceId', S.string().format('uuid'))
    .description('User province reference.')
    .required()
}
