import S from 'fluent-json-schema'
import { getStates } from '../lib/common.js'

// Validation schemas

export function sCreateArticle() {
  return S.object()
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
    .prop(
      'tagsIds',
      S.array().items(S.string().format('uuid')).minItems(1).maxItems(50)
    )
    .description('Article tags ids.')
}

export function sUpdateArticle() {
  return S.object()
    .additionalProperties(false)
    .prop('title', S.string().minLength(3).maxLength(200))
    .description('Article title.')
    .prop('text', S.string().minLength(3))
    .description('Article text.')
    .prop('description', S.string().minLength(3).maxLength(500))
    .description('Article description.')
    .prop('categoryId', S.string().format('uuid'))
    .description('Article category id.')
    .prop(
      'tagsIds',
      S.array().items(S.string().format('uuid')).minItems(1).maxItems(50)
    )
    .description('Article tags ids.')
}

// Serialization schemas

export function sArticle() {
  return S.object()
    .description('Article.')
    .additionalProperties(false)
    .prop('id', S.string().format('uuid'))
    .description('Article id.')
    .required()
    .prop('title', S.string().minLength(3).maxLength(200))
    .description('Article title.')
    .required()
    .prop('text', S.string().minLength(3))
    .description('Article text.')
    .prop('status', S.string().enum(getStates()))
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
    .prop('categoryId', S.string().format('uuid'))
    .description('Article category id.')
    .required()
    .prop('tags', S.array().items(S.string()))
    .description('Article tags.')
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
    .prop('status', S.string().enum(getStates()))
    .description('Article status.')
    .required()
    .prop('createdAt', S.string().format('date-time'))
    .description('Article creation date.')
    .required()
    .prop('publishedAt', S.string().format('date-time'))
    .description('Article publish date.')
    .required()
    .prop('canBeDeleted', S.boolean())
    .description('Defines if the article can be deleted.')
    .required()
}
