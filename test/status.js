import t from 'tap'
import Fastify from 'fastify'
import { join, resolve } from 'path'
import { readFileSync } from 'fs'
import { config } from 'dotenv'

import App from '../app.js'
config()

const { version } = JSON.parse(readFileSync(join(resolve(), 'package.json')))

t.test('Status API', async t => {
  t.plan(2)

  const fastify = Fastify()
  fastify.register(App)
  t.teardown(() => fastify.close())

  const response = await fastify.inject({
    method: 'GET',
    path: 'api/v1/status'
  })

  t.equal(response.statusCode, 200)
  t.match(response.json(), { status: 'ok', version })
})