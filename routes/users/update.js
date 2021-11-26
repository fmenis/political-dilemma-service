import S from 'fluent-json-schema'

import { sUpdateUser, sUserResponse } from './lib/schema.js'

export default async function updateUser(fastify) {
  const { db, httpErrors } = fastify

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
    handler: onUpdateUser,
  })

  async function onUpdateUser(req, reply) {
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

    const user = await db.findOne('SELECT id FROM users WHERE id=$1', [id])
    if (!user) {
      throw httpErrors.notFound(`User with id '${id}' not found`)
    }

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

    let updatedUser

    try {
      const { rowCount, rows } = await db.execQuery(query, inputs)
      if (!rowCount) {
        throw httpErrors.conflict('The action had no effect')
      }

      updatedUser = rows[0]
    } catch (error) {
      if (error.code && error.code === '23505') {
        // duplicate unique value error
        throw httpErrors.conflict(error.message.replace(/"/g, ''))
      }
      throw error
    }

    reply.send(updatedUser)
  }
}
