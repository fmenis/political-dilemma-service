// import { createTransport } from 'nodemailer'
import Fp from 'fastify-plugin'

function mailer(fastify, options, done) {
  console.log(options, done)
  // const transporter = createTransport()

  fastify.decorate('mailer', {})
}

export default Fp(mailer)
