import S from 'fluent-json-schema'

export default async function health(fastify, opts) {
	fastify.route({
		method: 'GET',
		path: '/health',
		schema: {
			response: {
				200: S.object()
					.additionalProperties(true)
					.prop('status', S.string())
			}
		},
		handler: onHealth
	})

	async function onHealth(req, reply) {
		return { status: 'OK' }
	}
}