import t from 'tap'
import Fastify from 'fastify'
import { config } from 'dotenv'
config()

import App from '../src/app.js'
import { ENV } from '../src/common/enums.js'

t.test('Create User API OK', async t => {
  t.plan(3)

  const fastify = Fastify()
  fastify.register(App, { envData: { NODE_ENV: ENV.DEVELOPMENT } })

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
    method: 'DELETE',
    path: 'api/v1/users/12',
    cookies: {
      session: `${loginRes.cookies[0].value}`,
    },
  })

  t.equal(statusRes.statusCode, 204)
})
