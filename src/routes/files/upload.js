import S from 'fluent-json-schema'
import multipart from '@fastify/multipart'
import { join, extname } from 'path'
import { stat, mkdir } from 'fs/promises'
import { nanoid } from 'nanoid'

import { CATEGORIES } from './lib/enums.js'
import { calcFileSize, moveFile } from './lib/utils.js'
import { appConfig } from '../../config/main.js'
import { calculateBaseUrl } from '../../utils/main.js'
import { sAttachment } from '../common/common.schema.js'

export default async function uploadFile(fastify) {
  fastify.register(multipart, {
    limits: {
      fields: 2,
      files: appConfig.upload.maxUploadsForRequest,
    },
    attachFieldsToBody: true,
  })

  const { massive, config, httpErrors } = fastify

  fastify.route({
    method: 'POST',
    path: '/upload',
    config: {
      public: false,
    },
    schema: {
      summary: 'Upload files',
      description: 'Upload files.',
      body: S.object()
        .additionalProperties(false)
        .prop('files')
        .description('Files binaries.')
        .required()
        .prop('type')
        .description('File type.')
        .required()
        .prop('target')
        .description('File target.')
        .required(),
      response: {
        200: S.array()
          .items(sAttachment())
          .minItems(1)
          .maxItems(appConfig.upload.maxUploadsForRequest),
      },
    },
    handler: onUploadFile,
  })

  async function onUploadFile(req) {
    const { user } = req

    const files = await req.saveRequestFiles()

    const { entityRelativePath, category, target } = getFilesMetadata(req.body)
    const populatedFiles = await populateFiles(
      files,
      entityRelativePath,
      category,
      target
    )

    await checkFiles(populatedFiles)
    await moveFiles(populatedFiles, entityRelativePath)
    const urls = await indexFiles(populatedFiles, user)

    return urls
  }

  function populateFiles(files, entityRelativePath, category, target) {
    async function populateFile(file) {
      const fileStats = await stat(file.filepath)
      const extension = extname(file.filename)
      const filesystemFileName = `${nanoid()}${extension}`

      return {
        ...file,
        destPath: join(
          config.STATIC_FILES_DEST,
          entityRelativePath,
          filesystemFileName
        ),
        extension: extension.slice(1),
        size: calcFileSize(fileStats.size),
        url: `${calculateBaseUrl({
          port: 8080,
        })}/static/${entityRelativePath}/${filesystemFileName}`,
        category,
        target,
      }
    }

    return Promise.all(files.map(async file => populateFile(file)))
  }

  function checkFiles(files) {
    const { allowedFileExts, maxSize } = appConfig.upload

    async function checkFile(file) {
      if (!allowedFileExts.includes(file.extension)) {
        throw httpErrors.conflict(
          `File '${file.filename}' can't be uploaded: extension '${file.extension}' not allowed`
        )
      }

      if (file.size > maxSize) {
        throw httpErrors.conflict(
          `File '${file.filename}' can't be uploaded: size '${file.size}' exceed limits`
        )
      }
    }

    return Promise.all(files.map(file => checkFile(file)))
  }

  async function moveFiles(files, entityRelativePath) {
    await mkdir(join(config.STATIC_FILES_DEST, entityRelativePath), {
      recursive: true,
    })
    return Promise.all(
      files.map(file => moveFile(file.filepath, file.destPath))
    )
  }

  async function indexFiles(files, user) {
    async function indexFile(file, user, tx) {
      const {
        destPath,
        url,
        filename,
        extension,
        mimetype,
        size,
        category,
        target,
      } = file

      const newFile = await tx.files.save({
        fullPath: destPath,
        url: encodeURI(url),
        fileName: filename,
        extension,
        mimetype,
        size,
        ownerId: user.id,
        category,
        target,
      })

      return { id: newFile.id, url: newFile.url, target: newFile.target }
    }

    const filesData = await massive.withTransaction(async tx => {
      const fileData = await Promise.all(
        files.map(file => indexFile(file, user, tx))
      )
      return fileData
    })

    return filesData
  }

  function getFilesMetadata(body) {
    const type = body.type
    if (!type) {
      throw new Error(`Specify the required field 'type'`)
    }

    const target = body.target
    if (!target) {
      throw new Error(`Specify the required field 'target'`)
    }

    const result = {
      category: type.value,
      entityRelativePath: '',
      target: target.value,
    }

    switch (result.category) {
      case CATEGORIES.ARTICLE_IMAGE:
        result.entityRelativePath = 'articles/images'
        break

      case CATEGORIES.ACTIVITY_IMAGE:
        result.entityRelativePath = 'activities/images'
        break

      default:
        throw new Error(`File type ${result.category} not allowed`)
    }

    return result
  }
}
