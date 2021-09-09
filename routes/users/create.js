import S from 'fluent-json-schema'
import { hashString } from '../lib/hash.js'

export default async function health(fastify, opts) {
  fastify.route({
    method: 'POST',
    path: '/users',
    schema: {
      body: S.object()
        .additionalProperties(false)
        .prop('firstName', S.string().minLength(3).maxLength(50))
        .prop('lastName', S.string().minLength(3).maxLength(50))
        .prop('username', S.string().minLength(3).maxLength(50))
        .required()
        .prop('email', S.string().format(S.FORMATS.EMAIL))
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
    const { pg, log, httpErrors } = this
    const { body } = req

    const res = await pg.query(
      `SELECT case
        WHEN username = $1
          THEN 'username'
        WHEN email = $2
          THEN 'email'
        END AS campomatch
        FROM users WHERE username = $1 OR email = $2`,
      [body.username, body.email]
    )

    if (res.length) {
      const match = res[0].campomatch
      throw httpErrors.unauthorized(`${match} '${body[match]}' already esists`)
    }

    log.debug(`Creating user ${body.email}...`)

    const password = await hashString(body.password, parseInt(process.env.SALT_ROUNDS))

    await pg.users.save({
      firstname: body.firstName,
      lastname: body.lastName,
      username: body.username,
      email: body.email,
      password,
      bio: body.bio,
      isblocked: body.isBlocked,
      roleid: body.roleId
    });

    log.debug(`User ${body.email} created!`)
    reply.code(204)
  }
}