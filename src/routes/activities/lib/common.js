import { ACTIVITY_STATES } from '../../common/enums.js'
import {
  ACTIVITY_TYPES,
  ACTIVITY_SHORT_TYPES,
  COMBINED_TYPES,
} from './common.enums.js'

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
