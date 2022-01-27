import S from 'fluent-json-schema'

export default async function checkLink(fastify) {
  const { pg } = fastify

  fastify.route({
    method: 'GET',
    path: '/reset-password/:token',
    config: {
      public: true,
    },
    schema: {
      params: S.object()
        .additionalProperties(false)
        .prop('token', S.string().minLength(60).maxLength(60))
        .description('Reset password token')
        .required(),
      response: {
        204: fastify.getSchema('sNoContent'),
      },
    },
    preHandler: onPreHandler,
    handler: onCheckLink,
  })

  async function onPreHandler(req, reply) {
    const { token, log } = req.params

    //TODO aggiungere log
    //TODO migliorare messaggi errore (italiano)

    let error = 'Password reset flow failed. '

    const resetLink = await pg.execQuery(
      'SELECT * FROM reset_links WHERE token=$1',
      [token],
      { findOne: true }
    )

    if (!resetLink) {
      error += 'Rest link not found.'
      return reply.render('/reset-password/reset-password-error.html', {
        error,
      })
    }

    if (resetLink.alreadyUsed) {
      error += 'Rest link already userd.'
      return reply.render('/reset-password/reset-password-error.html', {
        error,
      })
    }

    if (new Date().toISOString() > resetLink.expiredAt.toISOString()) {
      error += 'Rest link expired.'
      return reply.render('/reset-password/reset-password-error.html', {
        error,
      })
    }

    const user = await pg.execQuery(
      'SELECT * FROM users WHERE id=$1',
      [resetLink.userId],
      { findOne: true }
    )

    if (!user) {
      error += 'User not found.'
      return reply.render('/reset-password/reset-password-error.html', {
        error,
      })
    }

    if (user.isBlocked) {
      error += 'User blocked.'
      return reply.render('/reset-password/reset-password-error.html', {
        error,
      })
    }

    if (user.isDeleted) {
      error += 'User deleted.'
      return reply.render('/reset-password/reset-password-error.html', {
        error,
      })
    }

    req.user = user
  }

  async function onCheckLink(req, reply) {
    const { user } = req

    // await pg.execQuery(
    //   'UPDATE reset_links SET already_used=$2 WHERE user_id=$1',
    //   [user.id, true]
    // )

    return reply.render('/reset-password/reset-password-form.html', {
      firstName: 'Phil',
    })
  }
}
