import { hashString } from '../../lib/hash.js'
import { sUserResponse, sUserRequestBody } from './lib/schema.js'

export default async function createUser(fastify, opts) {
  const { db, config, httpErrors } = fastify

  fastify.route({
    method: 'POST',
    path: '/',
    config: {
      public: false
    },
    schema: {
      tags: ['users'],
      summary: 'Create user',
      description: 'Create user.',
      body: sUserRequestBody(),
      response: {
      	201: sUserResponse()
      }
    },
    preHandler: async function (req, reply) {
      const { user_name, email, password, confirm_password } = req.body

      const query = 'SELECT id FROM users ' +
        'WHERE user_name=$1 OR email=$2'

      const already_insered = await db.findOne(query, [user_name, email])
  
      if (already_insered) {
        throw httpErrors.badRequest(`Username or email already used`)
      }

      if (password !== confirm_password) {
        throw httpErrors.badRequest('Password and password confirmation are not equal')
      }
    },
    handler: onCreateUser
  })

  async function onCreateUser(req, reply) {
    const { body } = req

    const userObj = {
      ...body,
      //TODO capire se non serve dal momento in cui la colonna è not null
      is_blocked: body.is_blocked ?? false,
      password: await hashString(body.password, parseInt(config.SALT_ROUNDS)),
    }

    const user = await execQuery(userObj, db)
    reply.code(201).send(user)
  }

  async function execQuery(obj, db) {
    const query = 'INSERT INTO users ' +
      '(first_name, last_name, user_name, email, password, bio, is_blocked) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7) ' +
      'RETURNING id, first_name, last_name, user_name, email, bio, is_blocked, created_at, updated_at'

    const inputs = [obj.first_name, obj.last_name, obj.user_name, obj.email, obj.password, obj.bio, obj.is_blocked]
    const res = await db.execQuery(query, inputs)
    return res.rows[0]
  }
}