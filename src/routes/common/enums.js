const STATES = {
  DRAFT: 'DRAFT',
  IN_REVIEW: 'IN_REVIEW',
  READY: 'READY',
  PUBLISHED: 'PUBLISHED',
  REWORK: 'REWORK',
  ARCHIVED: 'ARCHIVED',
  DELETED: 'DELETED',
}

const CATEGORY_TYPES = {
  ARTICLE: 'ARTICLE',
  ACTIVITY: 'ACTIVITY',
}

const ARTICLE_STATES = STATES
const ACTIVITY_STATES = STATES

export { ARTICLE_STATES, ACTIVITY_STATES, CATEGORY_TYPES }
