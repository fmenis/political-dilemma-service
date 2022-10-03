import S from 'fluent-json-schema'

import { sInternalNote } from './lib/schema.js'

export default async function createInternalNote(fastify) {
  const { massive, httpErrors } = fastify

  fastify.route({
    method: 'POST',
    path: '/',
    config: {
      public: false,
    },
    schema: {
      summary: 'Create internal note',
      description: `Create internal note`,
      body: S.object()
        .additionalProperties(false)
        .prop('text', S.string().minLength(3).maxLength(250))
        .description('Internal note text.')
        .required()
        .prop('relatedDocumentId', S.string().format('uuid'))
        .description('Internal note related document id.')
        .required()
        .prop(
          'category',
          S.string().minLength(3).maxLength(50).enum(['articles', 'activities'])
        )
        .description('Internal note category.')
        .required(),
      response: {
        201: sInternalNote(),
        404: fastify.getSchema('sNotFound'),
      },
    },
    preHandler: onPreHandler,
    handler: onCreateInternalNote,
  })

  async function onPreHandler(req) {
    const { relatedDocumentId, category } = req.body

    const relatedDocument = await massive[category].findOne(relatedDocumentId, {
      fields: ['id'],
    })
    if (!relatedDocument) {
      throw httpErrors.notFound(
        `Related document '${relatedDocumentId}' not found`
      )
    }
  }

  async function onCreateInternalNote(req, reply) {
    const { relatedDocumentId, category, text } = req.body
    const { id: ownerId } = req.user

    const [internalNote, owner] = await Promise.all([
      massive.internalNotes.save({
        ownerId,
        text,
        relatedDocumentId,
        category,
      }),
      massive.users.findOne(ownerId, {
        fields: ['first_name', 'last_name'],
      }),
    ])

    reply.code(201)

    return {
      ...internalNote,
      author: `${owner.first_name} ${owner.last_name}`,
    }
  }
}
