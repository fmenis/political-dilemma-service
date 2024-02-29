import { sUserAccount } from './lib/schema.js'

export default async function accountUser(fastify) {
  const { pg, httpErrors } = fastify

  fastify.route({
    method: 'GET',
    path: '/account',
    config: {
      public: false,
    },
    schema: {
      summary: 'Get user account',
      description: 'Get user account.',
      response: {
        200: sUserAccount(),
        404: fastify.getSchema('sNotFound'),
      },
    },
    preHandler: onPreHandler,
    handler: onAccountUser,
  })

  async function onPreHandler(req) {
    const { id } = req.user

    const query = `SELECT 
                    users.id, users.first_name, users.last_name, users.user_name, users.email, 
                    users.type, users.id_region, users.id_province, users.bio, users.birth_date,  
                    users.joined_date, users.sex, users.is_blocked, is_deleted, roles.name as "roleName",
                    users.last_access
                  FROM users  
                  JOIN users_roles 
                  ON users_roles.user_id = users.id
                  JOIN roles
                  ON users_roles.role_id = roles.id
                  WHERE users.id = $1`

    const user = await pg.execQuery(query, [id], { findOne: true })
    if (!user) {
      throw httpErrors.notFound(`User with id '${id}' not found`)
    }

    req.user = user
  }

  async function onAccountUser(req) {
    const { user } = req

    return {
      ...user,
      role: user.roleName,
      regionId: user.idRegion,
      provinceId: user.idProvince,
    }
  }
}
