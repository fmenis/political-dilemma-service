import S from 'fluent-json-schema'

import { sArticleList } from '../lib/schema.js'

export default async function listArticles(fastify) {
  const { massive } = fastify

  fastify.route({
    method: 'GET',
    path: '/',
    config: {
      public: false,
      permission: 'article:list',
    },
    schema: {
      summary: 'List articles',
      description: 'Get all articles.',
      response: {
        200: S.object()
          .additionalProperties(false)
          .description('Articles.')
          .prop('results', S.array().items(sArticleList()))
          .required(),
      },
    },
    handler: onListArticles,
  })

  async function onListArticles() {
    const articles = await massive.articles.find()

    return {
      results: articles.map(item => ({
        ...item,
        author: 'Mario Rossi',
      })),
    }
  }
}
