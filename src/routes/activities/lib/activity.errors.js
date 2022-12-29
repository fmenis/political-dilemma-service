import Fp from 'fastify-plugin'
import _ from 'lodash'

async function activityErrors(fastify) {
  const { createError } = fastify.httpErrors

  function throwNotFoundError(data) {
    const { name, id } = data
    const message = `Entity ${name} '${id}' not found`
    throw createError(404, message, {
      internalCode: 'NOT_FOUND',
      details: { entityId: id, entityName: name },
    })
  }

  function throwInvalidCategoryError(data) {
    const { type, id } = data
    const message = `Invalid category type '${type}'. Required: 'ACTIVITY'`
    throw createError(409, message, {
      internalCode: 'INVALID_CATEGORY_TYPE',
      details: { entityId: id, categoryType: type },
    })
  }

  function throwDuplicateTitleError(data) {
    const { title } = data
    const message = `Title '${title}' already exists`
    throw createError(409, message, {
      internalCode: 'DUPLICATE_TITLE',
      details: { duplicatedTitle: title },
    })
  }

  function throwInvalidPubblicazioneInGazzettaDateError(data) {
    const { dataPubblicazioneInGazzetta } = data
    const message = 'Invalid input'
    throw createError(400, message, {
      internalCode: 'INVALID_PUBBLICAZIONE_GAZZETTA_DATE',
      validation: [
        {
          message: `PubblicazioneInGazzetta date '${dataPubblicazioneInGazzetta}' cannot be in the future`,
        },
      ],
    })
  }

  function throwAttachmentsNotFoundError(data) {
    const { attachmentIds, files } = data
    const missingAttachmentIds = _.difference(
      attachmentIds,
      files.map(item => item.id)
    )
    const message = `Attachment ids '${missingAttachmentIds.join(
      ', '
    )}' not found`
    throw createError(404, message, {
      internalCode: 'ATTACHMENTS_NOT_FOUND',
      details: { missingAttachmentIds },
    })
  }

  function throwOwnershipError(data) {
    const { id, email } = data
    const message = `Current user isn't the owner of the resource and it hasn't the right permission to performe the action`
    throw createError(403, message, {
      internalCode: 'OWNERSHIP_RESTRICTION',
      details: { entityId: id, userEmail: email },
    })
  }

  function throwInvalidStatusError(data) {
    const { id, requiredStatus } = data
    const message = `Action not allowed on activity '${id}'. Required status '${requiredStatus}'`
    throw createError(409, message, {
      internalCode: 'INVALID_STATUS',
      details: {
        articleId: id,
        requiredStatus,
      },
    })
  }

  fastify.decorate('activityErrors', {
    throwNotFoundError,
    throwInvalidCategoryError,
    throwDuplicateTitleError,
    throwInvalidPubblicazioneInGazzettaDateError,
    throwAttachmentsNotFoundError,
    throwOwnershipError,
    throwInvalidStatusError,
    errors: [
      {
        code: '*NOT_FOUND*',
        description: 'occurs when the target entity is not present.',
        apis: ['create', 'read', 'update'],
        statusCode: 404,
      },
      {
        code: '*INVALID_CATEGORY_TYPE*',
        description: 'occurs when the category type is invalid.',
        apis: ['create', 'update'],
        statusCode: 409,
      },
      {
        code: '*DUPLICATE_TITLE*',
        description: 'occurs when the title is already used.',
        apis: ['create', 'update'],
        statusCode: 409,
      },
      {
        code: '*INVALID_PUBBLICAZIONE_GAZZETTA_DATE*',
        description:
          'occurs when the pubblicazioneInGazzetta date is in the future.',
        apis: ['create', 'update'],
        statusCode: 400,
      },
      {
        code: '*ATTACHMENTS_NOT_FOUND*',
        description: 'occurs when the attachment id/s are not present.',
        apis: ['create', 'update'],
        statusCode: 404,
      },
      {
        code: '*OWNERSHIP_RESTRICTION*',
        description:
          'occurs when an operation is done on a resource that have a different owner.',
        apis: ['read', 'update'],
        statusCode: 403,
      },
      {
        code: '*INVALID_STATUS*',
        description:
          'occurs when the current status is not valid to perform the requested action.',
        apis: ['update'],
        statusCode: 409,
      },
    ],
  })
}

export default Fp(activityErrors)
