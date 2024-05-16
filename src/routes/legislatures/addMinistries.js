import S from 'fluent-json-schema'

import { sAddMinistries, sLegislatureDetail } from './lib/schema.js'
import { buildRouteFullDescription } from '../common/common.js'
import { populateLegislature } from './lib/common.js'
import { findArrayDuplicates } from '../../utils/main.js'

export default async function addMinistries(fastify) {
  const { massive } = fastify
  const { throwNotFoundError, throwDuplicateMinistriesError, errors } =
    fastify.legislatureErrors

  const routeDescription = 'Add ministries.'
  const api = 'add-ministries'
  const permission = `legislature:${api}`

  fastify.route({
    method: 'POST',
    path: '/:id/add-ministries',
    config: {
      public: false,
      permission,
    },
    schema: {
      summary: routeDescription,
      description: buildRouteFullDescription({
        description: routeDescription,
        errors,
        permission,
        api,
      }),
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.string().format('uuid'))
        .description('Legislature id.')
        .required(),
      body: sAddMinistries(),
      response: {
        200: sLegislatureDetail(),
        404: fastify.getSchema('sNotFound'),
        409: fastify.getSchema('sConflict'),
      },
    },
    preValidation: async function (req) {
      req.body.ministries = req.body.ministries.map(item => ({
        name: item.name.trim(),
        ministerFullName: item.ministerFullName.trim(),
      }))
    },
    preHandler: onPreHandler,
    handler: onAddMinistries,
  })

  async function onPreHandler(req) {
    const { id } = req.params

    const ministries = req.body.ministries.map(item => ({
      name: item.name.trim(),
      ministerFullName: item.ministerFullName.trim(),
    }))

    const legislature = await massive.legislature.findOne(id)
    if (!legislature) {
      throwNotFoundError({ id })
    }

    const ministriesDuplicates = findArrayDuplicates(
      ministries.map(item => item.name)
    )
    const ministersDuplicates = findArrayDuplicates(
      ministries.map(item => item.ministerFullName)
    )
    if (ministriesDuplicates.length || ministersDuplicates.length) {
      throwDuplicateMinistriesError({
        duplicates: [...ministriesDuplicates, ...ministersDuplicates],
      })
    }

    //##TODO check ministers already added

    req.resource = legislature
  }

  async function onAddMinistries(req) {
    const { ministries } = req.body
    const { resource: legislature } = req

    await Promise.all(
      ministries.map(
        async item =>
          await massive.ministry.save({
            name: item.name,
            ministerFullName: item.ministerFullName,
            legislatureId: legislature.id,
          })
      )
    )

    return populateLegislature(legislature, massive)
  }
}
