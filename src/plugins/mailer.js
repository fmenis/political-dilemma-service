import Fp from 'fastify-plugin'
import { createTransport } from 'nodemailer'
import aws from 'aws-sdk'

function mailer(fastify, options, done) {
  const { config, log } = fastify

  const ses = new aws.SES({
    // apiVersion: '',
    region: config.AWS_REGION,
  })

  const transporter = createTransport({
    SES: { ses, aws },
  })

  if (fastify.config.NODE_ENV !== 'development') {
    transporter.verify(err => {
      if (err) {
        done(err)
      }
      log.debug('Email trasporter correctly verified')
      done()
    })
  } else {
    done()
  }

  fastify.decorate('mailer', transporter)
}

export default Fp(mailer)
