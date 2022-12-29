import S from 'fluent-json-schema'

import { sTags, sAllowedActions } from '../../common/common.schema.js'
import { getActivityStates } from '../lib/common.js'
import { getActivityTypes, getActivityShortTypes } from './common.js'

export function sCreateActivity() {
  return S.object()
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
    .prop('tags', sTags())
    .description('Activity tags.')
    .prop(
      'attachmentIds',
      S.array()
        .items(S.string().format('uuid'))
        .minItems(1)
        .maxItems(50)
        .uniqueItems(true)
    )
    .description('Activity attachments ids.')
    .prop(
      'linkGazzettaUfficiale',
      S.string().format('uri').minLength(10).maxLength(500)
    )
    .description('Activity offical gazzette link.')
    .prop('dataPubblicazioneInGazzetta', S.string().format('date'))
    .description('Activity offical gazzette publication date.')
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
    .prop('author', S.string())
    .description('Activity author.')
    .required()
    .prop('categoryId', S.string().format('uuid'))
    .description('Activity category id.')
    .required()
    .prop('type', S.string().enum(getActivityTypes()))
    .description('Activity type.')
    .required()
    .prop('shortType', S.string().enum(getActivityShortTypes()))
    .description('Activity abbreviated type.')
    .required()
    .prop('tags', sTags().raw({ nullable: true }))
    .description('Activity tags.')
    .prop('rating', S.number().raw({ nullable: true }))
    .description('Activity rating.')
    .prop(
      'attachments',
      S.array()
        .items(
          S.object()
            .additionalProperties(false)
            .prop('id', S.string().format('uuid'))
            .description('File id.')
            .required()
            .prop('url', S.string().format('uri'))
            .description('File url.')
            .required()
        )
        .maxItems(10)
        .raw({ nullable: true })
    )
    .description('Activity attachments ids.')
    .prop(
      'linkGazzettaUfficiale',
      S.string().minLength(10).maxLength(500).raw({ nullable: true })
    )
    .description('Activity offical gazzette link.')
    .prop(
      'dataPubblicazioneInGazzetta',
      S.string().format('date').raw({ nullable: true })
    )
    .description('Activity offical gazzette publication date.')
    .prop(
      'cancellationReason',
      S.string().minLength(3).maxLength(500).raw({ nullable: true })
    )
    .description('Activity cancellation reason.')
    .prop('createdAt', S.string())
    .description('Activity creation date.')
    .required()
    .prop('publishedAt', S.string())
    .description('Activity publication date.')
    .required()
    .prop('updatedAt', S.string())
    .description('Activity last change date.')
    .required()
    .prop('isMine', S.boolean())
    .description('Defines if the current user is the owner of the article.')
    .required()
    .prop('allowedActions', sAllowedActions())
    .required()
    .description('Activity allowed actions.')
}

export function sActivityList() {
  return S.object()
    .additionalProperties(false)
    .prop('id', S.string().format('uuid'))
    .description('Activity id.')
    .required()
    .prop('title', S.string().minLength(3).maxLength(200))
    .description('Activity title.')
    .required()
    .prop('status', S.string().enum(getActivityStates()))
    .description('Activity status.')
    .required()
    .prop('author', S.string())
    .description('Activity author.')
    .required()
    .prop('category', S.string())
    .description('Activity category.')
    .required()
    .prop('type', S.string().enum(getActivityTypes()))
    .description('Activity type.')
    .required()
    .prop('shortType', S.string().enum(getActivityShortTypes()))
    .description('Activity abbreviated type.')
    .required()
    .prop('isMine', S.boolean())
    .description('Defines if the current user is the owner of the activity.')
    .required()
}

export function sUpdateActivity() {
  return S.object()
    .prop('title', S.string().minLength(3).maxLength(200))
    .description('Activity title.')
    .prop('description', S.string().raw({ nullable: true }))
    .description('Activity description.')
    .prop('text', S.string().minLength(3).raw({ nullable: true }))
    .description('Activity text.')
    .prop('categoryId', S.string().format('uuid'))
    .description('Activity category id.')
    .prop('type', S.string().enum(getActivityTypes()))
    .description('Activity type.')
    .prop('tags', sTags().raw({ nullable: true }))
    .description('Activity tags.')
    .prop('rating', S.number().raw({ nullable: true }))
    .description('Activity rating.')
    .prop(
      'attachmentIds',
      S.array()
        .items(S.string().format('uuid'))
        .minItems(1)
        .maxItems(50)
        .raw({ nullable: true })
    )
    .description('Activity attachments ids.')
    .prop(
      'linkGazzettaUfficiale',
      S.string().minLength(10).maxLength(500).raw({ nullable: true })
    )
    .description('Activity offical gazzette link.')
    .prop(
      'dataPubblicazioneInGazzetta',
      S.string().format('date').raw({ nullable: true })
    )
    .description('Activity offical gazzette publication date.')
    .prop(
      'cancellationReason',
      S.string().minLength(3).maxLength(500).raw({ nullable: true })
    )
    .description('Activity cancellation reason.')
}
