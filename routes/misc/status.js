import S from 'fluent-json-schema'
import { join, resolve } from 'path'
import { readFileSync } from 'fs'

const { version } = JSON.parse(readFileSync(join(resolve(), 'package.json')))

export default async function status(fastify, opts) {
	fastify.route({
		method: 'GET',
		path: '/status',
		schema: {
			tags: ['misc'],
			summary: 'Get application status and version',
			description: 'Returns status and version of the server.',
			response: {
				200: S.object()
					.prop('status', S.string())
					.description('Status')
					.prop('version', S.string())
					.description('Server version')
			}
		},
		handler: onStatus
	})

	async function onStatus(req, reply) {
		return { status: 'ok', version }
	}
}