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
        .prop('articleId', S.string().format('uuid'))
        .description('Internal note related article.')
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
    const { articleId } = req.body

    const article = await massive.articles.findOne(articleId, {
      fields: ['id'],
    })

    if (!article) {
      throw httpErrors.notFound(`Related article '${articleId}' not found`)
    }
  }

  async function onCreateInternalNote(req, reply) {
    const { articleId, category, text } = req.body
    const { id: ownerId } = req.user

    const [internalNote, owner] = await Promise.all([
      massive.internalNotes.save({
        ownerId,
        text,
        articleId,
        category,
      }),
      massive.users.findOne(ownerId, {
        fields: ['first_name', 'last_name'],
      }),
    ])

    reply.resourceId = internalNote.id
    reply.code(201)

    return {
      ...internalNote,
      author: `${owner.first_name} ${owner.last_name}`,
    }
  }
}
