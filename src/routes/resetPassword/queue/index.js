/**
 * https://github.com/taskforcesh/bullmq/issues/1414
 */
Object.defineProperty(Error.prototype, 'toJSON', {
  value: this,
})

import Fp from 'fastify-plugin'
import { Queue, Worker } from 'bullmq'

import { sendResetPasswordEmail } from './sendResetLinkEmail.js'

async function resetLinkQueue(fastify) {
  const { log, mailer, config } = fastify

  const queueOpts = {
    prefix: 'jobQueue',
    connection: {
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
    },
  }

  const workerOpts = {
    ...queueOpts,
    concurrency: 2,
  }

  const queue = new Queue('resetLinksQueue', queueOpts)
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
    workerOpts
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
