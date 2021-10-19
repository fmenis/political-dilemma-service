import S from 'fluent-json-schema'

import { hashString } from '../lib/hash.js'
import { sUser, sUserRequestBody } from './lib/schema.js'

export default async function createUser(fastify, opts) {
  fastify.route({
    method: 'POST',
    path: '/',
    schema: {
      tags: ['users'],
			summary: 'Create user',
      description: 'Create user.',
      body: sUserRequestBody(),
      response: {
      	201: sUser()
      }
    },
    handler: onCreateUser
  })

  async function onCreateUser(req, reply) {
    const { pg, log } = this
    const { body } = req

    log.debug(`Creating user ${body.email}...`)

    const user = {
      ...body,
      password: await hashString(body.password, parseInt(process.env.SALT_ROUNDS)),
    }

    await pg.users.save(user);

    log.debug(`User ${body.email} created!`)

    //TODO deve ritornare tutto l'oggetto (anche id)
    // usare la keyword returning di pg
    reply.code(201)
    return user
  }
}