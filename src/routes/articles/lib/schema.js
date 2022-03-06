import S from 'fluent-json-schema'
import { STATUS } from '../lib/enums.js'

export function sCreateArticle() {
  return S.object()
    .additionalProperties(false)
    .prop('title', S.string().minLength(3).maxLength(200))
    .description('Article title.')
    .required()
    .prop('text', S.string().minLength(3))
    .description('Article text.')
    .prop('category', S.string().enum(['decreti', 'estero']))
    .description('Article category.')
    .required()
}

export function sArticleResponse() {
  return S.object()
    .additionalProperties(false)
    .prop('id', S.string().format('uuid'))
    .description('Article id.')
    .prop('title', S.string().minLength(3).maxLength(200))
    .description('Article title.')
    .required()
    .prop('text', S.string().minLength(3))
    .description('Article text.')
    .prop('category', S.string().enum(['decreti', 'estero']))
    .description('Article category.')
    .required()
    .prop('status', S.string().enum([STATUS.DRAFTED, STATUS.PUBLISHED]))
    .description('Article status.')
    .required()
}
