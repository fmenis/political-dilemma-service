import S from 'fluent-json-schema'
import moment from 'moment'

import { sUpdateUser, sUserResponse } from './lib/schema.js'

export default async function updateUser(fastify) {
  const { db, httpErrors } = fastify
  const { createError } = httpErrors

  fastify.route({
    method: 'PUT',
    path: '/:id',
    config: {
      public: false,
    },
    schema: {
      summary: 'Update user',
      description: 'Update user by id.',
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.integer().minimum(1))
        .description('User id')
        .required(),
      body: sUpdateUser(),
      response: {
        200: sUserResponse(),
        404: fastify.getSchema('sNotFound'),
        409: fastify.getSchema('sConflict'),
      },
    },
    preHandler: async function (req) {
      const { userName, email, birthDate } = req.body
      const { id } = req.params

      const user = await db.execQuery(
        'SELECT id FROM users WHERE id=$1',
        [id],
        {
          findOne: true,
        }
      )
      if (!user) {
        throw httpErrors.notFound(`User with id '${id}' not found`)
      }

      if (userName) {
        const { rows: rowsUsername } = await db.execQuery(
          'SELECT id FROM users WHERE user_name=$2 AND id<>$1',
          [id, userName]
        )
        if (rowsUsername.length) {
          throw createError(400, 'Bad Request', {
            validation: [{ message: `Username '${userName}' already used` }],
          })
        }
      }

      if (email) {
        const { rows: rowsEmail } = await db.execQuery(
          'SELECT id FROM users WHERE email=$2 AND id<>$1',
          [id, email]
        )
        if (rowsEmail.length) {
          throw createError(400, 'Bad Request', {
            validation: [{ message: `Email '${email}' already used` }],
          })
        }
      }

      if (birthDate) {
        const today = moment().format('YYYY-MM-DD')
        if (birthDate > today || birthDate === today) {
          throw createError(400, 'Bad Request', {
            validation: [
              {
                message: 'Birth date cannot be greater than or equal to today',
              },
            ],
          })
        }
      }
    },
    handler: onUpdateUser,
  })

  async function onUpdateUser(req) {
    const {
      firstName,
      lastName,
      userName,
      email,
      bio,
      birthDate,
      sex,
      isBlocked,
    } = req.body

    const { id } = req.params

    const query =
      'UPDATE users SET ' +
      'first_name=$2, last_name=$3, user_name=$4, email=$5, bio=$6, ' +
      'birth_date=$7, sex=$8, is_blocked=$9, updated_at=$10 ' +
      'WHERE id=$1 ' +
      'RETURNING id, first_name, last_name, user_name, email, bio, ' +
      'birth_date, joined_date, sex, is_blocked'

    const inputs = [
      id,
      firstName,
      lastName,
      userName,
      email,
      bio,
      birthDate,
      sex,
      isBlocked,
      new Date(),
    ]

    const { rowCount, rows } = await db.execQuery(query, inputs)
    if (!rowCount) {
      throw httpErrors.conflict('The action had no effect')
    }

    return rows[0]
  }
}
