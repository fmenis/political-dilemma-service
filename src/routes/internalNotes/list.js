import S from 'fluent-json-schema'

import { sInternalNote } from './lib/schema.js'

export default async function listInternalNotes(fastify) {
  const { massive } = fastify

  fastify.route({
    method: 'GET',
    path: '/',
    config: {
      public: false,
      // permission, //TODO valutare se serve un permesso o possono utilizzarla tutti
    },
    schema: {
      summary: 'List internal note',
      description: `List internal note`,
      query: S.object()
        .additionalProperties(false)
        .prop('relatedDocumentId', S.string().format('uuid'))
        .description('Filter related document id.'),
      response: {
        200: S.object()
          .additionalProperties(false)
          .prop('results', S.array().maxItems(200).items(sInternalNote()))
          .required(),
      },
    },
    handler: onListInternalNotes,
  })

  async function onListInternalNotes(req) {
    const { relatedDocumentId } = req.query

    const criteria = relatedDocumentId ? { relatedDocumentId } : {}
    const internalNotes = await massive.internalNotes.find(criteria)

    return { results: internalNotes }
  }
}
