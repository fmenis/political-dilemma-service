import { stdTimeFunctions } from 'pino'

export function buildServerOptions() {
  return {
    logger: {
      level: process.env.LOG_LEVEL,
      timestamp: () => stdTimeFunctions.isoTime(),
      formatters: {
        level(label) {
          return { level: label }
        },
        bindings() {
          return { pid: undefined, hostname: undefined }
        },
      },
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
