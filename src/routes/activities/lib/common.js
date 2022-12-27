import { ACTIVITY_STATES } from '../../common/enums.js'
import {
  ACTIVITY_TYPES,
  ACTIVITY_SHORT_TYPES,
  COMBINED_TYPES,
} from './common.enums.js'
import { buildAllowedActions } from '../../common/common.js'

export function getActivityStates() {
  return Object.values(ACTIVITY_STATES)
}

export function getActivityTypes() {
  return Object.values(ACTIVITY_TYPES)
}

export function getActivityShortTypes() {
  return Object.values(ACTIVITY_SHORT_TYPES)
}

export function getShortType(type) {
  return COMBINED_TYPES[type]
}

export async function populateActivity(activity, currentUserId, massive) {
  const [author, attachments] = await Promise.all([
    massive.users.findOne(activity.ownerId, {
      fields: ['id', 'first_name', 'last_name'],
    }),
    massive.files.find({ activityId: activity.id }, { fields: ['id', 'url'] }),
  ])

  return {
    ...activity,
    author: `${author.first_name} ${author.last_name}`,
    canBeDeleted: activity.status === ACTIVITY_STATES.DRAFT,
    attachments: attachments.length > 0 ? attachments : null,
    allowedActions: buildAllowedActions(activity.status),
    isMine: activity.ownerId === currentUserId,
  }
}
