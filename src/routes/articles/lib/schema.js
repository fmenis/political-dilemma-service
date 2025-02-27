import S from 'fluent-json-schema'

import { sTags, sAttachment } from '../../common/common.schema.js'
import { getArticleStates } from '../lib/common.js'

export function sCreateArticle() {
  return (
    S.object()
      .additionalProperties(false)
      .prop('title', S.string().minLength(3).maxLength(200))
      .description('Article title.')
      .required()
      .prop('text', S.string().minLength(3))
      .description('Article text.')
      .prop('description', S.string().minLength(3).maxLength(500))
      .description('Article description.')
      .prop('categoryId', S.string().format('uuid'))
      .description('Article category id.')
      .required()
      .prop('tags', sTags())
      .description('Article tags.')
      .prop(
        'attachmentIds',
        S.array()
          .items(S.string().format('uuid'))
          .minItems(1)
          .maxItems(50)
          .uniqueItems(true)
      )
      //TODO non funziona, capire come mettere default su tipo dati non primitivi
      // .default(S.array())
      .description('Article attachments ids.')
  )
}

export function sUpdateArticle() {
  return S.object()
    .additionalProperties(false)
    .prop('title', S.string().minLength(3).maxLength(200))
    .description('Article title.')
    .prop('text', S.string().minLength(3).raw({ nullable: true }))
    .description('Article text.')
    .prop(
      'description',
      S.string().minLength(3).maxLength(500).raw({ nullable: true })
    )
    .description('Article description.')
    .prop('categoryId', S.string().format('uuid'))
    .description('Article category id.')
    .prop(
      'tags',
      S.array()
        .items(S.string().minLength(2).maxLength(30))
        .minItems(0) // allows all tags deletion
        .maxItems(50)
        .uniqueItems(true)
    )
    .description('Article tags.')
    .prop(
      'attachmentIds',
      S.array().items(S.string().format('uuid')).minItems(0).maxItems(50)
    )
    .description('Article attachments ids.')
}

export function sArticleDetail() {
  return S.object()
    .description('Article.')
    .additionalProperties(false)
    .prop('id', S.string().format('uuid'))
    .description('Article id.')
    .required()
    .prop('title', S.string().minLength(3).maxLength(200))
    .description('Article title.')
    .required()
    .prop('text', S.string().minLength(3).raw({ nullable: true }))
    .description('Article text.')
    .prop('status', S.string().enum(getArticleStates()))
    .description('Article status.')
    .required()
    .prop('author', S.string())
    .description('Article author.')
    .required()
    .prop('createdAt', S.string())
    .description('Article creation date.')
    .required()
    .prop('publishedAt', S.string())
    .description('Article publication date.')
    .required()
    .prop('updatedAt', S.string())
    .description('Article last change date.')
    .required()
    .prop('categoryId', S.string().format('uuid'))
    .description('Article category id.')
    .required()
    .prop('attachments', S.array().items(sAttachment()).maxItems(10))
    .description('Article attachments ids.')
    .prop('tags', sTags())
    .description('Article tags.')
    .prop(
      'description',
      S.string().minLength(3).maxLength(500).raw({ nullable: true })
    )
    .description('Article description.')
    .prop('cancellationReason', S.string().minLength(3).maxLength(500))
    .description('Article cancellation reason.')
    .prop('isMine', S.boolean())
    .description('Defines if the current user is the owner of the article.')
    .required()
}

export function sArticleList() {
  return S.object()
    .additionalProperties(false)
    .prop('id', S.string().format('uuid'))
    .description('Article id.')
    .prop('title', S.string().minLength(3).maxLength(200))
    .description('Article title.')
    .required()
    .prop('author', S.string())
    .description('Article author.')
    .required()
    .prop('status', S.string().enum(getArticleStates()))
    .description('Article status.')
    .required()
    .prop('createdAt', S.string().format('date-time'))
    .description('Article creation date.')
    .required()
    .prop('updatedAt', S.string().format('date-time'))
    .description('Article update date.')
    .required()
    .prop('publishedAt', S.string().format('date-time'))
    .description('Article publish date.')
    .required()
    .prop('hasNotifications', S.boolean())
    .description('Defines if the article have notifications.')
    .required()
    .prop('category', S.string())
    .description('Article category.')
    .required()
    .prop('isMine', S.boolean())
    .description('Defines if the current user is the owner of the article.')
    .required()
}
