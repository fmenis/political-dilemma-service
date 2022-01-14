import moment from 'moment'

import { hashString } from '../../../lib/hash.js'
import { sUserDetail, sCreateUser } from '../lib/schema.js'

export default async function createUser(fastify) {
  const { pg, config, httpErrors } = fastify
  const { createError } = httpErrors

  fastify.route({
    method: 'POST',
    path: '',
    config: {
      public: false,
      permission: 'user:create',
    },
    schema: {
      summary: 'Create user',
      description: 'Create user.',
      body: sCreateUser(),
      response: {
        201: sUserDetail(),
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
      regionId,
      provinceId,
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

    const region = await pg.execQuery(
      'SELECT id FROM regions WHERE id=$1',
      [regionId],
      { findOne: true }
    )
    if (!region) {
      throw createError(400, 'Invalid input', {
        validation: [{ message: `Region with id '${regionId}' not found` }],
      })
    }

    const province = await pg.execQuery(
      'SELECT id FROM provinces WHERE id=$1',
      [provinceId],
      { findOne: true }
    )
    if (!province) {
      throw createError(400, 'Invalid input', {
        validation: [{ message: `Province with id '${regionId}' not found` }],
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

    const user = await execQuery(userObj, pg)

    reply.status(201)

    return {
      ...user,
      regionId: user.idRegion,
      provinceId: user.idProvince,
    }
  }

  async function execQuery(obj, pg) {
    const query =
      'INSERT INTO users ' +
      '(first_name, last_name, user_name, email, password, bio, ' +
      'birth_date, sex, owner_id, id_region, id_province) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ' +
      'RETURNING id, first_name, last_name, user_name, email, bio, ' +
      'birth_date, joined_date, sex, is_blocked, is_deleted, ' +
      'id_region, id_province'

    const inputs = [
      obj.firstName,
      obj.lastName,
      obj.userName,
      obj.email,
      obj.password,
      obj.bio,
      obj.birthDate,
      obj.sex,
      obj.ownerId,
      obj.regionId,
      obj.provinceId,
    ]

    const res = await pg.execQuery(query, inputs)
    return res.rows[0]
  }
}
