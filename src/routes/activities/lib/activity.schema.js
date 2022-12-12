import S from 'fluent-json-schema'

//TODO siccome comuni anche agli articoli, spostartli in posto unico
import { getArticleStates } from '../../articles/lib/common.js'

//TODO siccome comuni anche agli articoli, spostartli in posto unico
export function sTags() {
  return S.array()
    .items(S.string().minLength(2).maxLength(30))
    .minItems(1)
    .maxItems(50)
}

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
      //TODO capire differenza con category e fare schema unico
      .prop(
        'type',
        S.string().enum([
          'DECRETO_LEGGE',
          'DECRETO_MINISTERIALE',
          'LEGGE_ORDINARIA',
        ])
      )
      .description('Activity type.')
      .required()
      .prop('tags', sTags())
      .description('Activity tags.')
  )
}

export function sActivityDetail() {
  return (
    S.object()
      .description('Activity detail.')
      .additionalProperties(false)
      .prop('id', S.string().format('uuid'))
      .description('Activity id.')
      .required()
      .prop('title', S.string().minLength(3).maxLength(200))
      .description('Activity title.')
      .required()
      //TODO capire come passare anche null
      // .prop('description', S.string().minLength(3).maxLength(500).)
      // .description('Activity description.')
      // .prop('text', S.string().minLength(3))
      // .description('Activity text.')
      .prop('status', S.string().enum(getArticleStates()))
      .description('Activity status.')
      .required()
      .prop('categoryId', S.string().format('uuid'))
      .description('Activity category id.')
      .required()
      //TODO capire differenza con category e fare schema unico
      .prop(
        'type',
        S.string().enum([
          'DECRETO_LEGGE',
          'DECRETO_MINISTERIALE',
          'LEGGE_ORDINARIA',
        ])
      )
      .description('Activity type.')
      .required()
      //TODO capire come passare anche null
      // .prop('tags', sTags())
      // .description('Activity tags.')
      .prop('createdAt', S.string())
      .description('Activity creation date.')
      .required()
      .prop('updatedAt', S.string())
      .description('Activity last change date.')
      .required()
  )
}
