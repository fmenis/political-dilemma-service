import Fp from 'fastify-plugin'
import Bull from 'bull'

import { sendResetEmail } from './sendResetLinkEmail.js'

async function resetLinkQueue(fastify) {
  const { log, mailer, config } = fastify

  const queue = new Bull('resetLinks')
  log.debug(`Queue '${queue.name}' initialized`)

  async function addJob(data) {
    const job = await queue.add('resetLink', data)
    log.debug(
      `Job '${job.name}' (id: ${job.id}) added to queue '${queue.name}'`
    )
  }

  queue.process('resetLink', async job => {
    await sendResetEmail({ ...job.data, from: config.SENDER_EMAIL }, mailer)
  })

  //TODO https://github.com/OptimalBits/bull#separate-processes
  // queue.process(
  //   'resetLink',
  //   './src/routes/resetPassword/queue/sendResetLinkEmail.js'
  // )

  queue.on('completed', job => {
    log.debug(`Job '${job.name}' (id: ${job.id}) has been completed`)
  })

  fastify.decorate('resetLinkQueue', {
    addJob,
  })
}

export default Fp(resetLinkQueue)
