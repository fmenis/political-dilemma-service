import sgMail from '@sendgrid/mail'

sgMail.setApiKey(
  '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'
)
const msg = {
  to: 'gaetano.danelli@me.com',
  from: 'dev@dilemmapolitico.info',
  subject: 'Sending with SendGrid is Fun (2)',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
}
sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent')
  })
  .catch(error => {
    console.error(error)
  })
