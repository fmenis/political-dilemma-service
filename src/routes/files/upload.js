import S from 'fluent-json-schema'
import multipart from '@fastify/multipart'
import { join, extname, basename } from 'path'
import { stat, mkdir } from 'fs/promises'
import { nanoid } from 'nanoid'

import { CATEGORIES } from './lib/enums.js'
import { calcFileSize, deleteFiles, moveFile } from './lib/utils.js'
import { appConfig } from '../../config/main.js'
import { calculateBaseUrl } from '../../utils/main.js'

export default async function uploadFile(fastify) {
  fastify.register(multipart, {
    limits: {
      fields: 0,
      files: appConfig.upload.maxUploadsForRequeset,
    },
    // attachFieldsToBody: 'keyValues', //TODO test
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
      // body: S.object()
      //   .additionalProperties(false)
      //   .prop('files')
      //   .description('')
      //   .required(),
      response: {
        200: S.array()
          .items(
            S.object()
              .additionalProperties(false)
              .description('Uploaded file/s.')
              .prop('id', S.string().format('uuid'))
              .description('File id.')
              .required()
              .prop('url', S.string().format('uri'))
              .description('File url.')
              .required()
          )
          .minItems(1)
          .maxItems(appConfig.upload.maxUploadsForRequeset),
      },
    },
    handler: onUploadFile,
  })

  async function onUploadFile(req) {
    const { user, log } = req
    const basePath = join(config.STATIC_FILES_DEST, 'articles/images')

    const files = await req.saveRequestFiles()

    try {
      const populatedFiles = await populateFiles(files, basePath)

      await checkFiles(populatedFiles)

      await moveFiles(populatedFiles, basePath)

      const urls = await indexFiles(populatedFiles, user)

      return urls
    } catch (error) {
      log.error('Error trying to upload file', error)
      // delete tmp files in any case
      await deleteFiles(files.map(file => file.filepath))
      throw error
    }
  }

  function populateFiles(files, basePath) {
    async function populateFile(file) {
      const fileStats = await stat(file.filepath)
      const extension = extname(file.filename)
      const fileName = basename(file.filename, extension)
      const filesystemFileName = `${fileName}_${nanoid()}${extension}`

      return {
        ...file,
        destPath: join(basePath, filesystemFileName),
        extension: extension.slice(1),
        size: calcFileSize(fileStats.size),
        url: `${calculateBaseUrl({
          port: 8080,
        })}/static/articles/images/${filesystemFileName}`,
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

  async function moveFiles(files, basePath) {
    await mkdir(basePath, { recursive: true })
    return Promise.all(
      files.map(file => moveFile(file.filepath, file.destPath))
    )
  }

  async function indexFiles(files, user) {
    async function indexFile(file, user, tx) {
      const { destPath, url, filename, extension, mimetype, size } = file
      const newFile = await tx.files.save({
        fullPath: destPath,
        url: encodeURI(url),
        fileName: filename,
        extension,
        mimetype,
        size,
        ownerId: user.id,
        category: CATEGORIES.ARTICLE_IMAGE,
      })

      return { id: newFile.id, url: newFile.url }
    }

    const filesData = await massive.withTransaction(async tx => {
      const fileData = await Promise.all(
        files.map(file => indexFile(file, user, tx))
      )
      return fileData
    })

    return filesData
  }
}
