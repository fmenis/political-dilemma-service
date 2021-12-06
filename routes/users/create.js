import { hashString } from '../../lib/hash.js'
import { sUserResponse, sCreateUser } from './lib/schema.js'

export default async function createUser(fastify) {
  const { db, config, httpErrors } = fastify
  const { createError } = httpErrors

  fastify.route({
    method: 'POST',
    path: '',
    config: {
      public: false,
    },
    schema: {
      summary: 'Create user',
      description: 'Create user.',
      body: sCreateUser(),
      response: {
        201: sUserResponse(),
      },
    },
    preHandler: async function (req) {
      const { userName, email, confirmEmail, password, confirmPassword } =
        req.body

      const query = 'SELECT id FROM users ' + 'WHERE user_name=$1 OR email=$2'
      const alreadyInsered = await db.execQuery(query, [userName, email], {
        findOne: true,
      })

      if (alreadyInsered) {
        throw createError(400, 'Bad Request', {
          validation: [`Username or email already used`],
        })
      }

      if (password !== confirmPassword) {
        throw createError(400, 'Bad Request', {
          validation: [`Password and password confirmation are not equal`],
        })
      }

      if (email !== confirmEmail) {
        throw createError(400, 'Bad Request', {
          validation: [`Email and email confirmation are not equal`],
        })
      }
    },
    handler: onCreateUser,
  })

  async function onCreateUser(req, reply) {
    const { body } = req

    const userObj = {
      ...body,
      //TODO capire se non serve dal momento in cui la colonna è not null
      isBlocked: body.isBlocked ?? false,
      password: await hashString(body.password, parseInt(config.SALT_ROUNDS)),
    }

    const user = await execQuery(userObj, db)
    reply.code(201).send(user)
  }

  async function execQuery(obj, db) {
    const query =
      'INSERT INTO users ' +
      '(first_name, last_name, user_name, email, password, bio, ' +
      'birth_date, sex, is_blocked) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ' +
      'RETURNING id, first_name, last_name, user_name, email, bio, ' +
      'birth_date, joined_date, sex, is_blocked'

    const inputs = [
      obj.firstName,
      obj.lastName,
      obj.userName,
      obj.email,
      obj.password,
      obj.bio,
      obj.birthDate,
      obj.sex,
      obj.isBlocked,
    ]
    const res = await db.execQuery(query, inputs)
    return res.rows[0]
  }
}
