import { ACTIVITY_STATES } from '../../common/enums.js'
import { ACTIVITY_TYPES } from './common.enums.js'

export function getActivityStates() {
  return Object.values(ACTIVITY_STATES)
}

export function getActivityTypes() {
  return Object.values(ACTIVITY_TYPES)
}
