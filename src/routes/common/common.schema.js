import S from 'fluent-json-schema'

export function sTags() {
  return S.array()
    .items(S.string().minLength(2).maxLength(30))
    .minItems(1)
    .maxItems(50)
    .uniqueItems(true)
}

export function sAllowedActions() {
  return S.object()
    .additionalProperties(false)
    .prop('canBeDeleted', S.boolean())
    .description('Defines if the activity can be deleted.')
    .required()
    .prop('canBeEdited', S.boolean())
    .description('Defines if the activity can be edited.')
    .required()
    .prop('canAskReview', S.boolean())
    .description(`Defines if the activity can be moved to status 'IN_REVIEW'.`)
    .required()
    .prop('canAskApprove', S.boolean())
    .description(`Defines if the activity can be moved to status 'APPROVED'.`)
    .required()
    .prop('canAskRework', S.boolean())
    .description(`Defines if the activity can be moved to status 'REWORK'.`)
    .required()
    .prop('canAskPublish', S.boolean())
    .description(`Defines if the activity can be moved to status 'PUBLISHED'.`)
    .required()
    .prop('canAskArchive', S.boolean())
    .description(`Defines if the activity can be moved to status 'ARCHIVED'.`)
    .required()
    .prop('canAskDelete', S.boolean())
    .description(`Defines if the activity can be moved to status 'DELETED'.`)
    .required()
}
