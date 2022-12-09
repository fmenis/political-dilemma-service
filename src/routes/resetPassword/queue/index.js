import Fp from 'fastify-plugin'
import { Queue, Worker } from 'bullmq'

import { sendResetPasswordEmail } from './sendResetLinkEmail.js'

async function resetLinkQueue(fastify) {
  const { log, mailer, config } = fastify

  const options = {
    prefix: 'jobQueue',
    connection: {
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
    },
  }

  const queue = new Queue('resetLinksQueue', options)
  log.debug(`Queue '${queue.name}' initialized`)

  async function addJob(data) {
    const job = await queue.add('sendResetPasswordEmail', data, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 500 },
    })

    log.debug(
      `Job '${job.name}' (id: ${job.id}) added to queue '${queue.name}'`
    )
  }

  const worker = new Worker(
    queue.name,
    async job => {
      return sendResetPasswordEmail(
        { ...job.data, from: config.SENDER_EMAIL },
        mailer
      )
    },
    options
  )

  worker.on('completed', job => {
    log.debug(`Job '${job.name}' (id: ${job.id}) has been completed`)
  })

  worker.on('failed', job => {
    log.error(
      `Job '${job.name}' (id: ${job.id}) has failed (attempt ${job.attemptsMade})`
    )
  })

  worker.on('error', err => {
    log.error(err)
  })

  fastify.decorate('resetLinkQueue', {
    addJob,
  })
}

export default Fp(resetLinkQueue)
