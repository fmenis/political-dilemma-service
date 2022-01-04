import t from 'tap'
import Fastify from 'fastify'
import { join, resolve } from 'path'
import { readFileSync } from 'fs'
import { config } from 'dotenv'
config()

import App from '../app.js'

const { version } = JSON.parse(readFileSync(join(resolve(), 'package.json')))

t.test('Status API', async t => {
  t.plan(4)

  const fastify = Fastify()
  fastify.register(App, { envData: { NODE_ENV: 'development' } })

  t.teardown(() => {
    console.log('Non ci entra')
    fastify.close()
  })

  const loginRes = await fastify.inject({
    method: 'POST',
    path: 'api/v1/auth/login',
    payload: {
      email: 'filippo@gmail.com',
      password: 'password',
    },
  })

  t.equal(loginRes.statusCode, 204)
  t.ok(loginRes.cookies[0].value)

  const statusRes = await fastify.inject({
    method: 'GET',
    path: 'api/v1/status',
    cookies: {
      session: `${loginRes.cookies[0].value}`,
    },
  })

  t.equal(statusRes.statusCode, 200)
  t.match(statusRes.json(), { status: 'ok', version })
})
