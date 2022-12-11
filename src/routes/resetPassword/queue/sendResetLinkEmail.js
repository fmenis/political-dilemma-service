import { readFile } from 'fs/promises'
import { resolve, join } from 'path'

export async function sendResetPasswordEmail(data, mailer) {
  const { email, from, templateParams } = data

  const template = await getTemplate()
  const html = compileTemplate(template, templateParams)

  await mailer.sendMail({
    from,
    to: email,
    subject: 'Ripristino password',
    html,
  })

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

function getTemplate() {
  const templateFilePath = join(
    resolve(),
    'src/public/reset-password',
    'index.html'
  )
  return readFile(templateFilePath, 'utf8')
}

function compileTemplate(template, templateParams) {
  for (const item of [
    'name',
    'validFor',
    'os',
    'browser',
    'resetLink',
    'supportEmail',
  ]) {
    const regExp = new RegExp(`{{${item}}}`, 'g')
    template = template.replace(regExp, templateParams[item])
  }

  return template
}
