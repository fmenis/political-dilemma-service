import { ARTICLE_STATES } from '../../common/enums.js'
import { buildAllowedActions } from '../../common/common.js'

export function getArticleStates() {
  return Object.values(ARTICLE_STATES)
}

export async function populateArticle(article, massive) {
  const [author, attachments] = await Promise.all([
    massive.users.findOne(article.ownerId, {
      fields: ['id', 'first_name', 'last_name'],
    }),
    massive.files.find({ articleId: article.id }, { fields: ['id', 'url'] }),
  ])

  return {
    ...article,
    author: `${author.first_name} ${author.last_name}`,
    canBeDeleted: article.status === ARTICLE_STATES.DRAFT,
    tags: article.tags || [],
    attachments,
    description: article.description || undefined,
    allowedActions: buildAllowedActions(article.status),
    isMine: article.ownerId === author.id,
  }
}
