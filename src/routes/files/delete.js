import S from 'fluent-json-schema'
import { deleteFiles } from './lib/utils.js'

export default async function deleteFile(fastify) {
  const { massive, httpErrors } = fastify
  const { createError } = httpErrors

  fastify.route({
    method: 'DELETE',
    path: '/:id',
    config: {
      public: false,
    },
    schema: {
      summary: 'Delete file',
      description: `Delete file`,
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.string().format('uuid'))
        .description('File id.')
        .required(),
      response: {
        204: fastify.getSchema('sNoContent'),
        404: fastify.getSchema('sNotFound'),
      },
    },
    preHandler: onPreHandler,
    handler: onDeleteFile,
  })

  async function onPreHandler(req) {
    const { id } = req.params

    const file = await massive.files.findOne(id, {
      fields: ['id', 'ownerId', 'fullPath'],
    })

    if (!file) {
      throw createError(404, 'Invalid input', {
        validation: [{ message: `File '${id}' not found` }],
      })
    }

    req.resource = file
  }

  async function onDeleteFile(req, reply) {
    const file = req.resource

    await Promise.all([
      deleteFiles(file.fullPath),
      massive.files.destroy(file.id),
    ])

    reply.code(204)
  }
}
