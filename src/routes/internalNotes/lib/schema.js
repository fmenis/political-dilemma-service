import S from 'fluent-json-schema'
import { getCategoryTypes } from '../../categories/lib/common.js'

export function sInternalNote() {
  return S.object()
    .description('Intenal note.')
    .additionalProperties(false)
    .prop('id', S.string().format('uuid'))
    .description('Internal note id.')
    .required()
    .prop('text', S.string().minLength(3).maxLength(250))
    .description('Internal note text.')
    .required()
    .prop(
      'category',
      S.string().minLength(3).maxLength(50).enum(getCategoryTypes())
    )
    .description('Internal note category.')
    .required()
    .prop('author', S.string())
    .description('Internal note author fullname.')
    .required()
    .prop('articleId', S.string().format('uuid').raw({ nullable: true }))
    .description('Internal note article id.')
    .prop('activityId', S.string().format('uuid').raw({ nullable: true }))
    .description('Internal note activity id.')
    .prop('createdAt', S.string().format('date-time'))
    .description('Internal note creation date.')
    .required()
}
