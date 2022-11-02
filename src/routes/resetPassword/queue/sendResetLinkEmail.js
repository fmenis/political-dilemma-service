export async function sendResetEmail(data, mailer) {
  const { email, resetLink, from } = data

  const html = `<div>
      Clicca il seguente <a href="${resetLink}">link</a>
      per reimpostare la password.
    </div>`

  const params = {
    from,
    to: email,
    subject: 'Reset password',
    html,
  }

  await mailer.sendMail(params)
}
