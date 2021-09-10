import S from 'fluent-json-schema'
import { join, resolve } from 'path'
import { readFileSync } from 'fs'

const { version } = JSON.parse(readFileSync(join(resolve(), 'package.json')))

export default async function status(fastify, opts) {
	fastify.route({
		method: 'GET',
		path: '/status',
		schema: {
			description: 'Returns status and version of the application',
			tags: ['misc', 'status'],
			summary: 'status',
			response: {
				200: S.object()
					.additionalProperties(true)
					.prop('status', S.string())
					.prop('version', S.string())
			}
		},
		handler: onStatus
	})

	async function onStatus(req, reply) {
		return { status: 'Ok', version }
	}
}