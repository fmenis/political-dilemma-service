export async function sendResetPasswordEmail(data, mailer) {
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

  /**
   * Hack to know when a job is finished correctly.
   * If the job is done correctly after 2 attempts, bull set anyway the error in the
   * 'failedReason' field with the prev errors.
   * Due to this, the whole job appears to have failed.
   * With this return value also the 'returnValue' field is set, so it is possibile
   * to distinguish if all the job attempts have failed or not.
   */
  return 'COMPLETED'
}
