import formData from 'form-data'
import Mailgun from 'mailgun.js'

const mailgun = new Mailgun(formData)

const mg = mailgun.client({
  username: 'api',
  key: 'd78b0266b3cf34a2389fc88fe7dded17-6fafb9bf-6be093ec',
})

mg.messages
  .create('sandbox550d305c299649a0b38675e6b779e824.mailgun.org', {
    from: 'Excited User <mailgun@sandbox550d305c299649a0b38675e6b779e824.mailgun.org>',
    to: ['gaetano.danelli@me.com'],
    subject: 'Hello',
    text: 'Testing some Mailgun awesomeness!',
    html: '<h1>Testing some Mailgun awesomeness!</h1>',
  })
  .then(msg => console.log(msg)) // logs response data
  .catch(err => console.log(err)) // logs any error
