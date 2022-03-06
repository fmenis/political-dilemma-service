import S from 'fluent-json-schema'
import { join, resolve } from 'path'
import { readFileSync } from 'fs'

const { version } = JSON.parse(readFileSync(join(resolve(), 'package.json')))

export default async function status(fastify) {
  fastify.route({
    method: 'GET',
    path: '/status',
    config: {
      public: false,
    },
    schema: {
      summary: 'Get application status and version',
      description: 'Returns status and version of the server.',
      response: {
        200: S.object()
          .prop('status', S.string())
          .description('Status.')
          .prop('version', S.string())
          .description('Server version.'),
      },
    },
    handler: onStatus,
  })

  async function onStatus() {
    return { status: 'ok', version }
  }
}
