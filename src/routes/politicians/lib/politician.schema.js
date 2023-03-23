import S from 'fluent-json-schema'

export function sPolitician() {
  return S.object()
    .additionalProperties(false)
    .prop('firstName', S.string().minLength(1).maxLength(50))
    .description('Politician first name.')
    .required()
    .prop('lastName', S.string().minLength(1).maxLength(50))
    .description('Politician first name.')
    .required()
    .prop('gender', S.string().enum(['MALE', 'FEMALE', 'OTHER'])) //##TODO fare enum
    .description('Politician gender.')
    .required()
    .prop('birthDate', S.string().format('date'))
    .description('Politician birth date.')
    .required()
    .prop('birthCity', S.string().minLength(1).maxLength(50))
    .description('Politician birth city.')
    .required()
    .prop('img', S.string().format('uri').minLength(10).maxLength(500))
    .description('Politician image url.')
    .required()
    .prop('link', S.string().format('uri').minLength(10).maxLength(500))
    .description('Politician doc link.')
    .required()
}
