import fp from 'fastify-plugin'
import { Queue, Worker } from 'bullmq'

import { importPoliticials } from '../scripts/jobs/importPoliticians.js'

async function scheduler(fastify) {
  const { massive, log } = fastify

  const queueOpts = {
    prefix: 'jobQueue',
    connection: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    },
  }

  const workerOpts = {
    ...queueOpts,
    concurrency: 2,
  }

  const queue = new Queue('imports', queueOpts)
  log.debug(`Queue '${queue.name}' initialized`)

  await queue.add(
    'import-politicians',
    {},
    {
      delay: 10000,
      repeat: {
        pattern: '* * * * *', // every minute
      },
    }
  )

  const worker = new Worker(
    queue.name,
    async job => {
      return importPoliticials(massive)
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
}

export default fp(scheduler)
