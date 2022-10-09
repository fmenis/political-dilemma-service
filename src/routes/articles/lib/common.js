import { ARTICLE_STATES } from '../lib/enums.js'

export function getArticleStates() {
  return Object.values(ARTICLE_STATES)
}

export async function populateArticle(article, massive) {
  //TODO migliorare con un join
  const [author, attachments] = await Promise.all([
    massive.users.findOne(article.ownerId, {
      fields: ['first_name', 'last_name'],
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
  }
}

function buildAllowedActions(status) {
  const allowedActions = {
    canAskReview: false,
    canAskApprove: false,
    canAskRework: false,
    canAskPublish: false,
    canAskArchive: false,
    canAskDelete: false,
  }

  if (status === ARTICLE_STATES.DRAFT) {
    allowedActions.canAskReview = true
  }

  if (status === ARTICLE_STATES.IN_REVIEW) {
    allowedActions.canAskApprove = true
    allowedActions.canAskRework = true
  }

  if (status === ARTICLE_STATES.REWORK) {
    allowedActions.canAskReview = true
  }

  if (status === ARTICLE_STATES.READY) {
    allowedActions.canAskPublish = true
  }

  if (status === ARTICLE_STATES.PUBLISHED) {
    allowedActions.canAskArchive = true
  }

  if (status !== ARTICLE_STATES.DRAFT) {
    allowedActions.canAskDelete = true
  }

  return allowedActions
}
