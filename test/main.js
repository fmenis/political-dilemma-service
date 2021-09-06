import t from 'tap'
import Fastify from 'fastify'

import App from '../app.js'

t.test('health', async t => {
  t.plan(2)

  const fastify = Fastify()
  fastify.register(App)

  const response = await fastify.inject({
    method: 'GET',
    path: 'api/v1/health'
  })

  t.equal(response.statusCode, 200)
  t.match(response.json(), { status: 'OK' })
})