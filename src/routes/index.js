import authentication from '../plugins/authentication.js'
import authorization from '../plugins/authorization.js'
import apiAudit from '../plugins/apitAudit.js'
import activityLog from '../plugins/activityLog.js'
import commonHooks from './common/commonHooks.js'

import authRoutes from './auth/index.js'
import userRoutes from './users/index.js'
import miscRoutes from './misc/index.js'
import sessionsRoutes from './sessions/index.js'
import permissionsRoutes from './permissions/index.js'
import rolesRoutes from './roles/index.js'
import resetPasswordRoutes from './resetPassword/index.js'
import articleRoutes from './articles/index.js'
import internalNotesRoutes from './internalNotes/index.js'
import fielsRoutes from './files/index.js'
import activitiesRoutes from './activities/index.js'

export default async function index(fastify) {
  fastify.register(authentication)
  fastify.register(authorization)
  fastify.register(apiAudit)
  fastify.register(activityLog)
  fastify.register(commonHooks)

  fastify.register(authRoutes)
  fastify.register(userRoutes)
  fastify.register(miscRoutes)
  fastify.register(sessionsRoutes)
  fastify.register(permissionsRoutes)
  fastify.register(rolesRoutes)
  fastify.register(resetPasswordRoutes)
  fastify.register(articleRoutes)
  fastify.register(internalNotesRoutes)
  fastify.register(fielsRoutes)
  fastify.register(activitiesRoutes)
}
