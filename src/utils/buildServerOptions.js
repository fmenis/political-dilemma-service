import { stdTimeFunctions } from 'pino'

export function buildServerOptions() {
  return {
    logger: buildLoggerOptions(),
    trustProxy: true,
    ajv: {
      customOptions: {
        allErrors: true,
        removeAdditional: false,
        // coerceTypes: 'array',
        // useDefaults ##TODO see if useful https://ajv.js.org/options.html#usedefaults
      },
    },
  }
}

function buildLoggerOptions() {
  const localTargets = [
    {
      target: 'pino-pretty',
      level: process.env.LOG_LEVEL,
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid, hostname',
      },
    },
  ]

  const liveTargets = [
    {
      target: 'pino/file',
      level: process.env.LOG_LEVEL,
      options: {
        destination: 1, // STDOUT
      },
    },
  ]

  return {
    level: process.env.LOG_LEVEL,
    timestamp: () => stdTimeFunctions.isoTime(),
    redact: {
      paths: [
        'password',
        'oldPassword',
        'newPassword',
        'newPasswordConfirmation',
      ],
      censor: '**GDPR COMPLIANT**',
    },
    // formatters: {
    //   level(label) {
    //     return { level: label }
    //   },
    //   bindings() {
    //     return { pid: undefined, hostname: undefined }
    //   },
    // },
    transport: {
      targets: process.env.NODE_ENV === 'local' ? localTargets : liveTargets,
    },
  }
}
