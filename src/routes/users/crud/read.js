import S from 'fluent-json-schema'
import { readFile } from 'fs'
import path from 'path'

import { promisify } from 'util'
const readFileAsync = promisify(readFile)

import { sUserDetail } from '../lib/schema.js'

export default async function readUser(fastify) {
  const { pg, httpErrors } = fastify

  let userReadQuery

  fastify.route({
    method: 'GET',
    path: '/:id',
    config: {
      public: false,
      permission: 'user:read',
    },
    schema: {
      summary: 'Get user',
      description: 'Get user by id.',
      params: S.object()
        .additionalProperties(false)
        .prop('id', S.integer().minimum(1))
        .description('User id')
        .required(),
      response: {
        200: sUserDetail(),
        404: fastify.getSchema('sNotFound'),
      },
    },
    handler: onReadUser,
  })

  async function onReadUser(req) {
    const { id } = req.params

    const user = await execQuery(id, pg)
    if (!user) {
      throw httpErrors.notFound(`User with id '${id}' not found`)
    }

    return user
  }

  async function execQuery(id, pg) {
    const query = await getAndCacheQuery()

    const user = await pg.execQuery(query, [id], { findOne: true })
    return {
      ...user,
      regionId: user.idRegion,
      provinceId: user.idProvince,
    }
  }

  async function getAndCacheQuery() {
    if (!userReadQuery) {
      const relativePath = 'src/routes/users/crud/sql/read.sql'
      const sqlFilePath = path.join(path.resolve(), relativePath)
      userReadQuery = await readFileAsync(sqlFilePath, 'utf8')
    }

    return userReadQuery
  }
}
