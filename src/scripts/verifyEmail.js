import aws from 'aws-sdk'

async function main() {
  const email = process.argv.slice(2)[0]

  if (!email) {
    throw new Error('No email provided')
  }

  try {
    await verifyEmail({ EmailAddress: email })
    console.log(`Correctly request email '${email}' verification`)
  } catch (err) {
    console.error(err)
    // eslint-disable-next-line no-process-exit
    process.exit(1)
  }
}

function verifyEmail(params) {
  return new Promise((resolve, reject) => {
    const ses = new aws.SES({
      region: process.env.AWS_REGION,
    })
    ses.verifyEmailIdentity(params, err => {
      if (err) {
        return reject(err)
      }
      resolve()
    })
  })
}

main()
