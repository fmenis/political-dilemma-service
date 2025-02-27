import Fp from 'fastify-plugin'

async function articleErrors(fastify) {
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
    const message = `Invalid category type '${type}'. Required: 'ARTICLE'`
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

  function throwInvalidStatusError(data) {
    const { id, requiredStatus } = data
    const message = `Action not allowed on article '${id}'. Required status '${requiredStatus}'`
    throw createError(409, message, {
      internalCode: 'INVALID_STATUS',
      details: {
        articleId: id,
        requiredStatus,
      },
    })
  }

  function throwInvalidPublicationDateError(data) {
    const { publicationDate } = data
    const message = 'Publication date must be in the future'
    throw createError(400, message, {
      internalCode: 'INVALID_PUBLICATION_DATE',
      validation: [
        {
          message: `Publication date '${publicationDate}' must be in the future`,
        },
      ],
    })
  }

  function throwMissingDataError(data) {
    const { id, errors } = data
    const message = `Action not allowed on article '${id}' due to a lack of data`
    throw createError(400, message, {
      internalCode: 'MISSING_DATA',
      validation: errors,
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

  fastify.decorate('articleErrors', {
    throwNotFoundError,
    throwInvalidCategoryError,
    throwDuplicateTitleError,
    throwAttachmentsNotFoundError,
    throwInvalidStatusError,
    throwInvalidPublicationDateError,
    throwMissingDataError,
    throwOwnershipError,
    errors: [
      {
        code: '*NOT_FOUND*',
        description: 'occurs when the target article is not present.',
        apis: [
          'create',
          'read',
          'update',
          'delete',
          'approve',
          'review',
          'rework',
          'publish',
          'archive',
          'remove',
        ],
        statusCode: 404,
      },
      {
        code: '*INVALID_CATEGORY_TYPE*',
        description: 'occurs when the category type is invalid.',
        apis: ['create'],
        statusCode: 409,
      },
      {
        code: '*DUPLICATE_TITLE*',
        description: 'occurs when the title is already used.',
        apis: ['create', 'update'],
        statusCode: 409,
      },
      {
        code: '*ATTACHMENTS_NOT_FOUND*',
        description: 'occurs when the attachment id/s are not present.',
        apis: ['create', 'update'],
        statusCode: 404,
      },
      {
        code: '*INVALID_STATUS*',
        description:
          'occurs when the current status is not valid to perform the requested action.',
        apis: [
          'update',
          'delete',
          'approve',
          'review',
          'rework',
          'publish',
          'archive',
          'remove',
        ],
        statusCode: 409,
      },
      {
        code: '*INVALID_PUBLICATION_DATE*',
        description: 'occurs when the publicationDate is not in the future.',
        apis: ['approve'],
        statusCode: 400,
      },
      {
        code: '*MISSING_DATA*',
        description: 'occurs when some article data is missing.',
        apis: ['review'],
        statusCode: 400,
      },
      {
        code: '*OWNERSHIP_RESTRICTION*',
        description: 'occurs when some article data is missing.',
        apis: ['read', 'update', 'delete'],
        statusCode: 400,
      },
    ],
  })
}

export default Fp(articleErrors)
