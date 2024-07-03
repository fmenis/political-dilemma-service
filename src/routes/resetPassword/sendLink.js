import S from 'fluent-json-schema'
import moment from 'moment'
import parser from 'ua-parser-js'

import { generateRandomToken } from './lib/utils.js'
// import { getGeolocationData } from '../common/services/geolocation.js'

export default async function sendResetPasswordLink(fastify) {
  const { massive, config, resetLinkQueue: queue } = fastify

  fastify.route({
    method: 'POST',
    path: '/reset-link',
    config: {
      public: true,
    },
    schema: {
      summary: 'Reset password email',
      description: 'Send reset password link by email.',
      body: S.object()
        .additionalProperties(false)
        .prop('email', S.string().format('email'))
        .description('Email address to which the reset link will be sent.')
        .required(),
      response: {
        202: fastify.getSchema('sAccepted'),
      },
    },
    preHandler: onPreHandler,
    handler: onSendResetPasswordLink,
  })

  async function onPreHandler(req, reply) {
    const { body, log } = req
    const { email } = body

    reply.code(202)

    let baseMessage = `Cannot send reset link. User with email '${email}'`

    const user = await massive.users.findOne(
      { email },
      {
        fields: ['id', 'first_name', 'is_blocked', 'is_deleted'],
      }
    )

    if (!user) {
      log.warn(`${baseMessage} not found`)
      return reply.send()
    }

    if (user.is_blocked) {
      log.warn(`${baseMessage} is blocked`)
      return reply.send()
    }

    if (user.is_deleted) {
      log.warn(`${baseMessage} is deleted`)
      return reply.send()
    }

    req.user = user
  }

  async function onSendResetPasswordLink(req) {
    const { email } = req.body
    const { user } = req

    /**
     * If the user request other reset links, for security reasons,
     * they must be delete before generate a new one
     */
    await massive.reset_links.destroy({ user_id: user.id })

    const token = await generateRandomToken(30)
    const resetLink = generateResetLink(req, token)
    const expiredAt = moment().add(config.RESET_LINK_TTL, 'seconds').toDate()

    await massive.withTransaction(async tx => {
      await tx.reset_links.save({
        user_id: user.id,
        token,
        link: resetLink,
        expired_at: expiredAt,
      })

      await queue.addJob({
        email,
        templateParams: buildTemplateParams({
          resetLink,
          user,
          userAgent: req.headers['user-agent'],
          ip: req.ip,
          // geolocation: await getGeolocationData(req.ip),
        }),
      })
    })
  }

  function generateResetLink(req, token) {
    const baseUrl = req.headers.origin || 'http://127.0.0.1:4200'
    return `${baseUrl}/reset-password?token=${token}`
  }

  //##TODO
  // async function getGeolocationData(ip) {
  //   const data = await getGeolocationData(ip)
  //   return {
  //     city: data.city,
  //     region: data.region,
  //     countryName: data.country_name,
  //   }
  // }

  function buildTemplateParams({ resetLink, user, userAgent, ip }) {
    const ua = new parser(userAgent)

    return {
      name: user.first_name,
      validFor: config.RESET_LINK_TTL / 60 / 60, // second to hours
      os: ua.getOS().name || 'unknown',
      browser: ua.getBrowser().name || 'unknown',
      ip,
      resetLink,
      supportEmail: config.SENDER_EMAIL,
    }
  }
}
