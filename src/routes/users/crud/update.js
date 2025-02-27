import S from 'fluent-json-schema'
import moment from 'moment'

import { sUpdateUser, sUserDetail } from '../lib/schema.js'

export default async function updateUser(fastify) {
  const { pg, httpErrors } = fastify
  const { createError } = httpErrors

  fastify.route({
    method: 'PUT',
    path: '/:id',
    config: {
      public: false,
      permission: 'user:update',
    },
    schema: {
      summary: 'Update user',
      description: 'Update user by id.',
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.string().format('uuid'))
        .description('User id.')
        .required(),
      body: sUpdateUser(),
      response: {
        200: sUserDetail(),
        404: fastify.getSchema('sNotFound'),
        409: fastify.getSchema('sConflict'),
      },
    },
    preHandler: onPreHandler,
    handler: onUpdateUser,
  })

  async function onPreHandler(req) {
    const { userName, email, birthDate, regionId, provinceId } = req.body
    const { id } = req.params

    const user = await pg.execQuery('SELECT id FROM users WHERE id=$1', [id], {
      findOne: true,
    })
    if (!user) {
      throw httpErrors.notFound(`User with id '${id}' not found`)
    }

    const { rows: rowsUsername } = await pg.execQuery(
      'SELECT id FROM users WHERE user_name=$2 AND id<>$1',
      [id, userName]
    )
    if (rowsUsername.length) {
      throw createError(400, 'Invalid input', {
        validation: [{ message: `Username '${userName}' already used` }],
      })
    }

    const { rows: rowsEmail } = await pg.execQuery(
      'SELECT id FROM users WHERE email=$2 AND id<>$1',
      [id, email]
    )
    if (rowsEmail.length) {
      throw createError(400, 'Invalid input', {
        validation: [{ message: `Email '${email}' already used` }],
      })
    }

    if (birthDate) {
      const today = moment().format('YYYY-MM-DD')
      if (birthDate > today || birthDate === today) {
        throw createError(400, 'Invalid input', {
          validation: [
            {
              message: 'Birth date cannot be greater than or equal to today',
            },
          ],
        })
      }
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

  async function onUpdateUser(req) {
    const { id } = req.params

    const {
      firstName,
      lastName,
      userName,
      email,
      bio,
      birthDate,
      sex,
      regionId,
      provinceId,
    } = req.body

    const query =
      'UPDATE users SET ' +
      'first_name=$2, last_name=$3, user_name=$4, email=$5, bio=$6, ' +
      'birth_date=$7, sex=$8, updated_at=$9, ' +
      'id_region=$10, id_province=$11 ' +
      'WHERE id=$1 ' +
      'RETURNING id, first_name, last_name, user_name, email, bio, ' +
      'birth_date, joined_date, sex, is_blocked, is_deleted, ' +
      'id_region, id_province, last_access'

    const getUserRoleQuery =
      'SELECT ur.role_id FROM users AS u ' +
      'JOIN users_roles AS ur ' +
      'ON u.id = ur.user_id ' +
      'WHERE u.id = $1'

    const inputs = [
      id,
      firstName,
      lastName,
      userName,
      email,
      bio,
      birthDate,
      sex,
      new Date(),
      regionId,
      provinceId,
    ]

    const [updateRes, getRoleRes] = await Promise.all([
      pg.execQuery(query, inputs),
      pg.execQuery(getUserRoleQuery, [id], {
        findOne: true,
      }),
    ])

    if (!updateRes.rowCount) {
      throw httpErrors.conflict('The action had no effect')
    }

    const user = updateRes.rows[0]

    return {
      ...user,
      regionId: user.idRegion,
      provinceId: user.idProvince,
      roleId: getRoleRes.roleId,
    }
  }
}
