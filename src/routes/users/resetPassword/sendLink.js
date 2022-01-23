import S from 'fluent-json-schema'
import moment from 'moment'

import { hashString } from '../../../lib/hash.js'
import { generateRandomToken } from '../lib/utils.js'

export default async function sendResetPasswordLink(fastify) {
  const { pg, config } = fastify

  fastify.route({
    method: 'POST',
    path: '/reset-link',
    config: {
      public: true,
    },
    schema: {
      body: S.object()
        .additionalProperties(false)
        .prop('email', S.string().format('email'))
        .description('Email address to which the reset link will be sent')
        .required(),
      response: {
        204: fastify.getSchema('sNoContent'),
      },
    },
    preHandler: onPreHandler,
    handler: onSendResetPasswordLink,
  })

  async function onPreHandler(req, reply) {
    const { body, log } = req
    const { email } = body

    reply.code(204)

    let baseMessage = `Cannot send reset link. User with email '${email}'`
    let error = false

    const user = await getUserByEmail(email)

    if (!user) {
      log.warn(`${baseMessage} not found`)
      error = true
    }

    if (user.isBlocked) {
      log.warn(`${baseMessage} is blocked`)
      error = true
    }

    if (user.isDeleted) {
      log.warn(`${baseMessage} is deleted`)
      error = true
    }

    if (error) {
      return
    }

    req.user = user
  }

  async function onSendResetPasswordLink(req) {
    const { email } = req.body
    const { user } = req

    //TODO se presente altri link in sospeso per lo stesso utente,
    // renderli inutilizzabili

    const token = await generateRandomToken(30)
    const hashedToken = await hashString(token, parseInt(config.SALT_ROUNDS))
    const expiredAt = moment().add(config.RESET_LINK_TTL, 'seconds').toDate()

    let client

    try {
      client = await pg.beginTransaction()

      const query =
        'INSERT INTO reset_links (user_id, token, expired_at) ' +
        'VALUES ($1, $2, $3)'

      await pg.execQuery(query, [user.id, hashedToken, expiredAt], { client })

      const baseUrl =
        config.NODE_ENV === 'production'
          ? `https://${config.DOMAIN_PROD}`
          : `http://127.0.0.1:${config.SERVER_PORT}`

      const resetLink = `${baseUrl}/reset-password/${token}`

      //TODO forse non ha senso, in quanto se l'email sta 10s a essere inviata
      // l'intera API resta bloccata
      await sendEmail(email, resetLink)

      await pg.commitTransaction(client)
    } catch (error) {
      await pg.rollbackTransaction(client)
      //TODO capire se mettere log.error
      throw error
    }
  }

  // ------------------------------ HELPERS ------------------------------

  function getUserByEmail(email) {
    return pg.execQuery(
      'SELECT id, is_blocked, is_deleted FROM users WHERE email=$1',
      [email],
      { findOne: true }
    )
  }

  async function sendEmail(email, resetLink) {
    console.log(email, resetLink)
    throw new Error('failed to send email')
  }
}
