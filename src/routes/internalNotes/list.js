import S from 'fluent-json-schema'

import { sInternalNote } from './lib/schema.js'

export default async function listInternalNotes(fastify) {
  const { massive, httpErrors } = fastify

  fastify.route({
    method: 'GET',
    path: '/',
    config: {
      public: false,
    },
    schema: {
      summary: 'List internal notes',
      description: `List internal notes`,
      query: S.object()
        .additionalProperties(false)
        .prop('relatedDocumentId', S.string().format('uuid'))
        .description('Filter related document id.')
        .prop(
          'category',
          S.string().minLength(3).maxLength(50).enum(['articles', 'activities'])
        ),
      //TODO
      // .dependentRequired({
      //   relatedDocumentId: ['category'],
      // }),
      response: {
        200: S.object()
          .additionalProperties(false)
          .prop('results', S.array().maxItems(200).items(sInternalNote()))
          .required(),
        404: fastify.getSchema('sNotFound'),
      },
    },
    preHandler: onPreHandler,
    handler: onListInternalNotes,
  })

  async function onPreHandler(req) {
    const { relatedDocumentId, category } = req.query

    if (relatedDocumentId && category) {
      const relatedDocument = await massive[category].findOne(
        relatedDocumentId,
        {
          fields: ['id'],
        }
      )
      if (!relatedDocument) {
        throw httpErrors.notFound(
          `Related document '${relatedDocumentId}' not found`
        )
      }
    }
  }

  async function onListInternalNotes(req) {
    const { relatedDocumentId } = req.query

    const criteria = relatedDocumentId ? { relatedDocumentId } : {}
    const internalNotes = await massive.internalNotes.find(criteria)

    return { results: internalNotes }
  }
}
