import S from 'fluent-json-schema'

import { sArticleList } from '../lib/schema.js'

export default async function listArticles(fastify) {
  const { massive } = fastify
  const permission = 'article:list'

  fastify.route({
    method: 'GET',
    path: '/',
    config: {
      public: false,
      permission,
    },
    schema: {
      summary: 'List articles',
      description: `Permission required: ${permission}`,
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
    //TODO migliorare con un join
    const articles = await massive.articles.find()
    const owners = await massive.users.find(
      {
        id: articles.map(item => item.ownerId),
      },
      { fields: ['id', 'first_name', 'last_name'] }
    )

    return {
      results: articles.map(article => {
        const author = owners.find(item => item.id === article.ownerId)
        return {
          ...article,
          author: `${author.first_name} ${author.last_name}`,
        }
      }),
    }
  }
}
