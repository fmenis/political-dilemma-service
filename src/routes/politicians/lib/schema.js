import S from 'fluent-json-schema'

// import { getPoliticianTypes } from './common.js'

export function sPoliticianList() {
  return S.object()
    .additionalProperties(false)
    .prop('id', S.string().format('uuid'))
    .description('Politician id.')
    .required()
    .prop('firstName', S.string().minLength(1).maxLength(50))
    .description('Politician first name.')
    .required()
    .prop('lastName', S.string().minLength(1).maxLength(50))
    .description('Politician first name.')
    .required()
    .prop('groupId', S.string().format('uuid').raw({ nullable: true }))
    .description('Politician group id.')
    .required()
    .prop('rating', S.number())
    .description('Politician rating.')
    .required()
}

// .prop('type', S.string().enum(getPoliticianTypes()))
// .description('Article type.')
// .required()
// .prop('gender', S.string().enum(['MALE', 'FEMALE', 'OTHER'])) //##TODO fare enum
// .description('Politician gender.')
// .required()
// .prop('birthDate', S.string().format('date'))
// .description('Politician birth date.')
// .required()
// .prop('birthCity', S.string().minLength(1).maxLength(50))
// .description('Politician birth city.')
// .required()
// .prop('img', S.string().format('uri').minLength(10).maxLength(500))
// .description('Politician image url.')
// .required()
// .prop('link', S.string().format('uri').minLength(10).maxLength(500))
// .description('Politician doc link.')
// .required()
