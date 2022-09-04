import S from 'fluent-json-schema'
import { ENV } from '../common/enums.js'

/**
 * TODO
 * Capire che differenza c'è tra aver il .required (o default) sul tipo dato
 * eg: prop('SERVER_PORT', S.string().required())
 * Oppure sulla prop
 * eg: prop('SERVER_PORT', S.string())
 *     .required()
 */

export function sEnv() {
  return S.object()
    .prop(
      'NODE_ENV',
      S.string().enum([ENV.PRODUCTION, ENV.STAGING, ENV.DEVELOPMENT]).required()
    )
    .prop('SERVER_ADDRESS', S.string())
    .default('127.0.0.1')
    .prop('SERVER_PORT', S.string())
    .default('3000')
    .prop('DOMAIN_PROD', S.string())
    .required()
    .prop('LOG_LEVEL', S.string())
    .default('info')
    .prop('SESSIONS_LIMIT', S.number())
    .default(4)
    .prop('PG_HOST', S.string())
    .required()
    .prop('PG_PORT', S.string())
    .required()
    .prop('PG_DB', S.string())
    .required()
    .prop('PG_USER', S.string())
    .required()
    .prop('PG_PW', S.string())
    .required()
    .prop('REDIS_HOST', S.string())
    .required()
    .prop('REDIS_PORT', S.string())
    .required()
    .prop('SECRET', S.string())
    .required()
    .prop('SESSION_TTL', S.string())
    .default(1800)
    .prop('COOKIE_TTL', S.string())
    .default(86400 * 180)
    .prop('RESET_LINK_TTL', S.number())
    .default(7200)
    .prop('LOG_REQ_BODY', S.boolean())
    .default(false)
    .prop('AWS_REGION', S.string())
    .required()
    .prop('AWS_ACCESS_KEY_ID', S.string())
    .required()
    .prop('AWS_SECRET_ACCESS_KEY', S.string())
    .required()
    .prop('SENDER_EMAIL', S.string())
    .required()
    .prop('STATIC_FILES_DEST', S.string())
    .required()
    .valueOf()
}
