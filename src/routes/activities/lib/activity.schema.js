import S from 'fluent-json-schema'

import { sTags } from '../../common/common.schema.js'
import { getActivityStates } from '../lib/common.js'
import { getActivityTypes } from './common.js'

export function sCreateActivity() {
  return (
    S.object()
      .additionalProperties(false)
      .prop('title', S.string().minLength(3).maxLength(200))
      .description('Activity title.')
      .required()
      .prop('text', S.string().minLength(3))
      .description('Activity text.')
      .prop('description', S.string().minLength(3).maxLength(500))
      .description('Activity description.')
      .prop('categoryId', S.string().format('uuid'))
      .description('Activity category id.')
      .required()
      .prop('type', S.string().enum(getActivityTypes()))
      .description('Activity type.')
      .required()
      //TODO
      // .prop('shorType', S.string().enum(getActivityTypes()))
      // .description('Activity type.')
      // .required()
      .prop('tags', sTags())
      .description('Activity tags.')
      .prop(
        'gazzetteLink',
        S.string().format('uri').minLength(10).maxLength(500)
      )
      .description('Activity offical gazzette link.')
      .prop('gazzettePublicationDate', S.string().format('date-time'))
      .description('Activity offical gazzette publication date.')
  )
}

export function sActivityDetail() {
  return S.object()
    .description('Activity detail.')
    .additionalProperties(false)
    .prop('id', S.string().format('uuid'))
    .description('Activity id.')
    .required()
    .prop('title', S.string().minLength(3).maxLength(200))
    .description('Activity title.')
    .required()
    .prop('description', S.string().raw({ nullable: true }))
    .description('Activity description.')
    .prop('text', S.string().minLength(3).raw({ nullable: true }))
    .description('Activity text.')
    .prop('status', S.string().enum(getActivityStates()))
    .description('Activity status.')
    .required()
    .prop('categoryId', S.string().format('uuid'))
    .description('Activity category id.')
    .required()
    .prop('type', S.string().enum(getActivityTypes()))
    .description('Activity type.')
    .required()
    .prop('tags', sTags().raw({ nullable: true }))
    .description('Activity tags.')
    .prop(
      'gazzetteLink',
      S.string().minLength(10).maxLength(500).raw({ nullable: true })
    )
    .description('Activity offical gazzette link.')
    .prop(
      'gazzettePublicationDate',
      S.string().format('date-time').raw({ nullable: true })
    )
    .description('Activity offical gazzette publication date.')
    .prop('createdAt', S.string())
    .description('Activity creation date.')
    .required()
    .prop('updatedAt', S.string())
    .description('Activity last change date.')
    .required()
}
