import Fp from 'fastify-plugin'
import sgMail from '@sendgrid/mail'

function mailer(fastify, options, done) {
  const { config } = fastify

  sgMail.setApiKey(config.SENDGRID_API_KEY)

  done()

  fastify.decorate('mailer', sgMail)
}

export default Fp(mailer)
