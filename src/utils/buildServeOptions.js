import { stdTimeFunctions } from 'pino'

export function buildServerOptions() {
  return {
    logger: {
      level: process.env.LOG_LEVEL,
      timestamp: () => stdTimeFunctions.isoTime(),
      redact: {
        paths: ['password'],
        censor: '**GDPR COMPLIANT**',
      },
    },
    trustProxy: true,
    ajv: {
      customOptions: {
        allErrors: true,
      },
    },
  }
}
