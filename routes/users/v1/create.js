import S from 'fluent-json-schema'

import { hashString } from '../../lib/hash.js'

export default async function health(fastify, opts) {
  fastify.route({
    method: 'POST',
    path: '/users',
    config: {
      trimFields: ['firstName', 'lastname', 'username', 'email', 'bio'],
      // capitalizeFields: ['firstName', 'lastname']
    },
    schema: {
      body: S.object()
        .additionalProperties(false)
        .prop('firstName', S.string().minLength(3).maxLength(50))
        .prop('lastName', S.string().minLength(3).maxLength(50))
        .prop('username', S.string().minLength(3).maxLength(50))
        .required()
        .prop('email', S.string()) //TODO validazione email
        .required()
        .prop('password', S.string().minLength(8))
        .required()
        .prop('bio', S.string().maxLength(500))
        .prop('createdAt', S.string().format('date-time'))
        .readOnly()
        .prop('updatedAt', S.string().format('date-time'))
        .prop('isBlocked', S.boolean().default(false))
        .prop('roleId', S.integer())
        .required(),
      // response: {
      // 	201: S.object()
      // 		.additionalProperties(true)
      // 		.prop('status', S.string())
      // }
    },
    handler: onCreate
  })

  async function onCreate(req, reply) {
    const { pg, log } = this
    const { body } = req

    const res = await pg.query(
      'SELECT username, email FROM users WHERE username = $1 OR email = $2',
      [body.username, body.email]
    )

    if (duplicateUsername) {

    }

    if (duplicateEmail) {

    }

    log.debug(`Creating user ${body.email}...`)

    const password = await hashString(body.password, parseInt(process.env.SALT_ROUNDS))

    const res2 = await pg.users.save({
      firstname: body.firstName,
      lastname: body.lastName,
      username: body.username,
      email: body.email,
      password,
      bio: body.bio,
      isblocked: body.isBlocked,
      roleid: body.roleId
    });

    console.log(res);

    log.debug(`User ${body.email} created!`)

    reply.code(204)
  }
}