import activityErrors from './lib/activity.errors.js'

import createRoute from './crud/create.js'
import listRoute from './crud/list.js'
import readRoute from './crud/read.js'
import updateRoute from './crud/update.js'
import deleteRoute from './crud/delete.js'

import reviewRoute from './review.js'
import reworkRoute from './rework.js'
import approveRoute from './approve.js'
import publishRoute from './publish.js'
import archiveRoute from './archive.js'
import removeRoute from './remove.js'

export default async function index(fastify) {
  fastify.addHook('onRoute', options => {
    options.schema = {
      ...options.schema,
      tags: ['activities'],
    }
  })

  fastify.register(activityErrors)

  const prefix = '/v1/activities'
  fastify.register(createRoute, { prefix })
  fastify.register(listRoute, { prefix })
  fastify.register(readRoute, { prefix })
  fastify.register(updateRoute, { prefix })
  fastify.register(deleteRoute, { prefix })

  fastify.register(reviewRoute, { prefix })
  fastify.register(reworkRoute, { prefix })
  fastify.register(approveRoute, { prefix })
  fastify.register(publishRoute, { prefix })
  fastify.register(archiveRoute, { prefix })
  fastify.register(removeRoute, { prefix })
}
