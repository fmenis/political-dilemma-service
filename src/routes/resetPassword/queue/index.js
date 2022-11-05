import Fp from 'fastify-plugin'
import Bull from 'bull'

import { sendResetEmail } from './sendResetLinkEmail.js'

async function resetLinkQueue(fastify) {
  const { log, mailer, config } = fastify

  const queue = new Bull('resetLinks', { prefix: 'jobQueue' })
  log.debug(`Queue '${queue.name}' initialized`)

  async function addJob(data) {
    const job = await queue.add('resetLink', data, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 500 },
    })

    log.debug(
      `Job '${job.name}' (id: ${job.id}) added to queue '${queue.name}'`
    )
  }

  queue.process('resetLink', job => {
    return sendResetEmail({ ...job.data, from: config.SENDER_EMAIL }, mailer)
  })

  queue.on('completed', job => {
    log.debug(`Job '${job.name}' (id: ${job.id}) has been completed`)
  })

  fastify.decorate('resetLinkQueue', {
    addJob,
  })
}

export default Fp(resetLinkQueue)
