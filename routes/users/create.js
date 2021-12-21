import { hashString } from '../../lib/hash.js'
import { sUserResponse, sCreateUser } from './lib/schema.js'
import moment from 'moment'

export default async function createUser(fastify) {
  const { pg, config, httpErrors } = fastify
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
    preHandler: preHandler,
    handler: onCreateUser,
  })

  async function preHandler(req) {
    const {
      userName,
      email,
      confirmEmail,
      password,
      confirmPassword,
      birthDate,
    } = req.body

    const query = 'SELECT id FROM users WHERE user_name=$1 OR email=$2'
    const alreadyInsered = await pg.execQuery(query, [userName, email], {
      findOne: true,
    })

    if (alreadyInsered) {
      throw createError(400, 'Invalid input', {
        validation: [{ message: 'Username or email already used' }],
      })
    }

    if (password !== confirmPassword) {
      throw createError(400, 'Invalid input', {
        validation: [
          { message: 'Password and password confirmation are not equal' },
        ],
      })
    }

    if (email !== confirmEmail) {
      throw createError(400, 'Invalid input', {
        validation: [{ message: 'Email and email confirmation are not equal' }],
      })
    }

    const today = moment().format('YYYY-MM-DD')
    if (birthDate > today || birthDate === today) {
      throw createError(400, 'Invalid input', {
        validation: [
          { message: 'Birth date cannot be greater than or equal to today' },
        ],
      })
    }
  }

  async function onCreateUser(req, reply) {
    const { body, user: owner } = req

    const userObj = {
      ...body,
      ownerId: owner.id,
      password: await hashString(body.password, parseInt(config.SALT_ROUNDS)),
    }

    const query =
      'INSERT INTO users ' +
      '(first_name, last_name, user_name, email, password, bio, ' +
      'birth_date, sex, owner_id) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ' +
      'RETURNING id, first_name, last_name, user_name, email, bio, ' +
      'birth_date, joined_date, sex, is_blocked, is_deleted, ' +
      'deleted_by, updated_by'

    const inputs = [
      userObj.firstName,
      userObj.lastName,
      userObj.userName,
      userObj.email,
      userObj.password,
      userObj.bio,
      userObj.birthDate,
      userObj.sex,
      userObj.ownerId,
    ]

    const user = await pg.execQuery(query, inputs, { findOne: true })
    reply.code(201).send(user)
  }
}
