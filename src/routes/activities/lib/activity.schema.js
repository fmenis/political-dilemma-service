import S from 'fluent-json-schema'

import { sTags } from '../../common/common.schema.js'
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
    .prop(
      'allowedActions',
      S.object()
        .additionalProperties(false)
        .prop('canBeDeleted', S.boolean())
        .description('Defines if the activity can be deleted.')
        .required()
        .prop('canBeEdited', S.boolean())
        .description('Defines if the activity can be edited.')
        .required()
        .prop('canAskReview', S.boolean())
        .description(
          `Defines if the activity can be moved to status 'IN_REVIEW'.`
        )
        .required()
        .prop('canAskApprove', S.boolean())
        .description(
          `Defines if the activity can be moved to status 'APPROVED'.`
        )
        .required()
        .prop('canAskRework', S.boolean())
        .description(`Defines if the activity can be moved to status 'REWORK'.`)
        .required()
        .prop('canAskPublish', S.boolean())
        .description(
          `Defines if the activity can be moved to status 'PUBLISHED'.`
        )
        .required()
        .prop('canAskArchive', S.boolean())
        .description(
          `Defines if the activity can be moved to status 'ARCHIVED'.`
        )
        .required()
        .prop('canAskDelete', S.boolean())
        .description(
          `Defines if the activity can be moved to status 'DELETED'.`
        )
        .required()
    )
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
    .description('Defines if the current user is the owner of the article.')
    .required()
}
