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
        .prop('articleId', S.string().format('uuid'))
        .description('Filter by article id.'),
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
    const { articleId } = req.query

    const article = await massive.articles.findOne(articleId, {
      fields: ['id'],
    })

    if (!article) {
      throw httpErrors.notFound(`Related article '${articleId}' not found`)
    }
  }

  async function onListInternalNotes(req) {
    const { articleId } = req.query

    const criteria = articleId ? { articleId } : {}

    const internalNotes = await massive.internalNotes
      .join({
        users: {
          type: 'INNER',
          on: { id: 'ownerId' },
        },
      })
      .find(criteria, {
        order: [
          {
            field: 'createdAt',
            direction: 'desc',
          },
        ],
      })

    return {
      results: internalNotes.map(item => {
        const author = item.users[0]
        item.author = `${author.first_name} ${author.last_name}`
        return item
      }),
    }
  }
}
